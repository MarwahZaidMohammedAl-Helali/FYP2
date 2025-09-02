const pool = require('./db');

// Scoring weights for different actions
const SCORE_WEIGHTS = {
  LOGIN: 5,
  SERVICE_POST: 10,
  MESSAGE_SENT: 3,
  PROFILE_UPDATE: 5,
  POSITIVE_REVIEW: 8,
  IGNORED_MESSAGE: -2,
  INCOMPLETE_PROFILE: -5,
  DAYS_INACTIVE: -1 // per day
};

// Engagement score thresholds
const THRESHOLDS = {
  LOW: 70,
  VERY_LOW: 50,
  CRITICAL: 30
};

// Update user's engagement score based on an action
async function updateEngagementScore(userId, actionType) {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // First, ensure the table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_engagement_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        engagement_score INT DEFAULT 100,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Get current score or create new entry
    let [scores] = await connection.query(
      'SELECT * FROM user_engagement_scores WHERE user_id = ?',
      [userId]
    );

    let currentScore = scores.length > 0 ? scores[0].engagement_score : 100;
    const scoreChange = SCORE_WEIGHTS[actionType] || 0;
    const newScore = Math.max(0, Math.min(100, currentScore + scoreChange));

    if (scores.length === 0) {
      await connection.query(
        'INSERT INTO user_engagement_scores (user_id, engagement_score) VALUES (?, ?)',
        [userId, newScore]
      );
    } else {
      await connection.query(
        'UPDATE user_engagement_scores SET engagement_score = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newScore, userId]
      );
    }

    // Record the action in history
    await connection.query(
      'INSERT INTO user_engagement_history (user_id, action_type, score_change) VALUES (?, ?, ?)',
      [userId, actionType, scoreChange]
    );

    await connection.commit();
    await checkAndTriggerReEngagement(userId, newScore);
    
    return newScore;
  } catch (error) {
    await connection.rollback();
    console.error('Error in updateEngagementScore:', error);
    // Don't throw the error, just log it
    return 100; // Return default score on error
  } finally {
    connection.release();
  }
}

// Check and trigger re-engagement funnel stages
async function checkAndTriggerReEngagement(userId, score) {
  try {
    if (score <= THRESHOLDS.CRITICAL) {
      await triggerDeactivationWarning(userId);
    } else if (score <= THRESHOLDS.VERY_LOW) {
      await triggerMissedOpportunities(userId);
    } else if (score <= THRESHOLDS.LOW) {
      await triggerPersonalizedNudge(userId);
    }
  } catch (error) {
    console.error('Error in re-engagement funnel:', error);
  }
}

// Stage 1: Hyper-Personalized Nudge
async function triggerPersonalizedNudge(userId) {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Check if we've already sent a nudge recently
    const [recentNudges] = await connection.query(
      `SELECT * FROM re_engagement_funnel 
       WHERE user_id = ? AND stage = 'NUDGE' 
       AND triggered_at > DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );

    if (recentNudges.length === 0) {
      // Find best matching service using AI algorithm
      const [userSkills] = await connection.query(
        'SELECT * FROM services WHERE user_id = ?',
        [userId]
      );

      // Simple matching algorithm (to be enhanced with AI)
      const [potentialMatches] = await connection.query(
        `SELECT s.*, u.username 
         FROM services s 
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id != ? 
         AND s.status = 'active' 
         ORDER BY s.rating DESC, s.reviews_count DESC 
         LIMIT 1`,
        [userId]
      );

      if (potentialMatches.length > 0) {
        const match = potentialMatches[0];
        
        // Record the suggestion
        await connection.query(
          `INSERT INTO ai_matchmaking_suggestions 
           (user_id, suggested_service_id, match_score) 
           VALUES (?, ?, ?)`,
          [userId, match.id, 0.8] // Example match score
        );

        // Record the nudge in re-engagement funnel
        await connection.query(
          `INSERT INTO re_engagement_funnel 
           (user_id, stage) 
           VALUES (?, 'NUDGE')`,
          [userId]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Stage 2: Missed Opportunities Digest
async function triggerMissedOpportunities(userId) {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Check if we've already sent a digest recently
    const [recentDigests] = await connection.query(
      `SELECT * FROM re_engagement_funnel 
       WHERE user_id = ? AND stage = 'MISSED_OPPORTUNITIES' 
       AND triggered_at > DATE_SUB(NOW(), INTERVAL 14 DAY)`,
      [userId]
    );

    if (recentDigests.length === 0) {
      // Get user's last login date
      const [userScore] = await connection.query(
        'SELECT last_login FROM user_engagement_scores WHERE user_id = ?',
        [userId]
      );

      if (userScore.length > 0) {
        // Find relevant services posted since last login
        const [newServices] = await connection.query(
          `SELECT id FROM services 
           WHERE created_at > ? 
           AND user_id != ? 
           AND status = 'active' 
           ORDER BY rating DESC, reviews_count DESC 
           LIMIT 3`,
          [userScore[0].last_login, userId]
        );

        if (newServices.length > 0) {
          // Record the digest
          await connection.query(
            `INSERT INTO missed_opportunities_digest 
             (user_id, service_ids) 
             VALUES (?, ?)`,
            [userId, JSON.stringify(newServices.map(s => s.id))]
          );

          // Record in re-engagement funnel
          await connection.query(
            `INSERT INTO re_engagement_funnel 
             (user_id, stage) 
             VALUES (?, 'MISSED_OPPORTUNITIES')`,
            [userId]
          );
        }
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Stage 3: Deactivation Warning
async function triggerDeactivationWarning(userId) {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Check if we've already sent a warning recently
    const [recentWarnings] = await connection.query(
      `SELECT * FROM re_engagement_funnel 
       WHERE user_id = ? AND stage = 'DEACTIVATION_WARNING' 
       AND triggered_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [userId]
    );

    if (recentWarnings.length === 0) {
      // Record the warning
      await connection.query(
        `INSERT INTO re_engagement_funnel 
         (user_id, stage) 
         VALUES (?, 'DEACTIVATION_WARNING')`,
        [userId]
      );

      // If no response after 7 days, deactivate
      setTimeout(async () => {
        const [warning] = await connection.query(
          `SELECT * FROM re_engagement_funnel 
           WHERE user_id = ? AND stage = 'DEACTIVATION_WARNING' 
           AND action_taken = FALSE 
           AND triggered_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
          [userId]
        );

        if (warning.length > 0) {
          await deactivateUser(userId);
        }
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Stage 4: Account Deactivation
async function deactivateUser(userId) {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Record deactivation in re-engagement funnel
    await connection.query(
      `INSERT INTO re_engagement_funnel 
       (user_id, stage) 
       VALUES (?, 'DEACTIVATED')`,
      [userId]
    );

    // Update user status (assuming you add a status field to users table)
    await connection.query(
      'UPDATE users SET status = "deactivated" WHERE id = ?',
      [userId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Calculate profile completion percentage
async function calculateProfileCompletion(userId) {
  const [user] = await pool.promise().query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  if (user.length === 0) return 0;

  const fields = ['username', 'email', 'profile_picture', 'bio', 'skills'];
  let completedFields = 0;

  for (const field of fields) {
    if (user[0][field]) completedFields++;
  }

  return Math.round((completedFields / fields.length) * 100);
}

// Daily score decay job
async function updateInactivityScores() {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get all active users
    const [users] = await connection.query(
      'SELECT id FROM users WHERE status != "deactivated"'
    );

    for (const user of users) {
      const [score] = await connection.query(
        'SELECT * FROM user_engagement_scores WHERE user_id = ?',
        [user.id]
      );

      if (score.length > 0) {
        const daysInactive = Math.floor(
          (new Date() - new Date(score[0].last_login)) / (1000 * 60 * 60 * 24)
        );

        if (daysInactive > 0) {
          const scoreChange = SCORE_WEIGHTS.DAYS_INACTIVE * daysInactive;
          const newScore = Math.max(0, score[0].engagement_score + scoreChange);

          await connection.query(
            'UPDATE user_engagement_scores SET engagement_score = ? WHERE user_id = ?',
            [newScore, user.id]
          );

          await connection.query(
            'INSERT INTO user_engagement_history (user_id, action_type, score_change) VALUES (?, "DAYS_INACTIVE", ?)',
            [user.id, scoreChange]
          );

          await checkAndTriggerReEngagement(user.id, newScore);
        }
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  updateEngagementScore,
  calculateProfileCompletion,
  updateInactivityScores,
  SCORE_WEIGHTS,
  THRESHOLDS
}; 
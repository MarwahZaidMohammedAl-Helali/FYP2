const pool = require('./db');
const userEngagement = require('./userEngagement');

// Run engagement updates every day at midnight
const scheduleEngagementUpdates = () => {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // tomorrow
    0, // midnight
    0, // 0 minutes
    0 // 0 seconds
  );
  const msUntilMidnight = night.getTime() - now.getTime();

  // Schedule first run at midnight
  setTimeout(() => {
    runDailyEngagementTasks();
    // Then schedule to run every 24 hours
    setInterval(runDailyEngagementTasks, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};

const runDailyEngagementTasks = async () => {
  console.log('Running daily engagement tasks...');
  
  try {
    // Update inactivity scores
    await userEngagement.updateInactivityScores();
    
    // Get all active users
    const [users] = await pool.promise().query(
      'SELECT id FROM users WHERE status != "deactivated"'
    );

    // Process each user
    for (const user of users) {
      await processUserEngagement(user.id);
    }

    console.log('Daily engagement tasks completed successfully');
  } catch (error) {
    console.error('Error running daily engagement tasks:', error);
  }
};

const processUserEngagement = async (userId) => {
  try {
    // Get user's current engagement score
    const [scores] = await pool.promise().query(
      'SELECT engagement_score FROM user_engagement_scores WHERE user_id = ?',
      [userId]
    );

    if (scores.length === 0) return;

    const score = scores[0].engagement_score;

    // Check if user needs AI matchmaking
    if (score <= 70 && score > 50) {
      await generateAiMatchmaking(userId);
    }
    
    // Check if user needs missed opportunities digest
    if (score <= 50 && score > 30) {
      await generateMissedOpportunities(userId);
    }
    
    // Check if user needs deactivation warning
    if (score <= 30) {
      await checkDeactivationWarning(userId);
    }
  } catch (error) {
    console.error(`Error processing user ${userId}:`, error);
  }
};

const generateAiMatchmaking = async (userId) => {
  try {
    // Check if we've sent a suggestion recently
    const [recentSuggestions] = await pool.promise().query(
      `SELECT * FROM ai_matchmaking_suggestions 
       WHERE user_id = ? 
       AND suggested_at > DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );

    if (recentSuggestions.length === 0) {
      // Get user's services to understand their skills
      const [userServices] = await pool.promise().query(
        'SELECT * FROM services WHERE user_id = ?',
        [userId]
      );

      // Find potential matches (to be enhanced with AI)
      const [matches] = await pool.promise().query(
        `SELECT s.*, u.username 
         FROM services s 
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id != ? 
         AND s.status = 'active' 
         ORDER BY s.rating DESC, s.reviews_count DESC 
         LIMIT 1`,
        [userId]
      );

      if (matches.length > 0) {
        const match = matches[0];
        
        // Record the suggestion
        await pool.promise().query(
          `INSERT INTO ai_matchmaking_suggestions 
           (user_id, suggested_service_id, match_score) 
           VALUES (?, ?, ?)`,
          [userId, match.id, 0.8] // Example match score
        );
      }
    }
  } catch (error) {
    console.error(`Error generating AI matchmaking for user ${userId}:`, error);
  }
};

const generateMissedOpportunities = async (userId) => {
  try {
    // Check if we've sent a digest recently
    const [recentDigests] = await pool.promise().query(
      `SELECT * FROM missed_opportunities_digest 
       WHERE user_id = ? 
       AND digest_sent_at > DATE_SUB(NOW(), INTERVAL 14 DAY)`,
      [userId]
    );

    if (recentDigests.length === 0) {
      // Get user's last login
      const [userScore] = await pool.promise().query(
        'SELECT last_login FROM user_engagement_scores WHERE user_id = ?',
        [userId]
      );

      if (userScore.length > 0 && userScore[0].last_login) {
        // Find relevant services posted since last login
        const [newServices] = await pool.promise().query(
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
          await pool.promise().query(
            `INSERT INTO missed_opportunities_digest 
             (user_id, service_ids) 
             VALUES (?, ?)`,
            [userId, JSON.stringify(newServices.map(s => s.id))]
          );
        }
      }
    }
  } catch (error) {
    console.error(`Error generating missed opportunities for user ${userId}:`, error);
  }
};

const checkDeactivationWarning = async (userId) => {
  try {
    // Check if we've sent a warning recently
    const [recentWarnings] = await pool.promise().query(
      `SELECT * FROM re_engagement_funnel 
       WHERE user_id = ? 
       AND stage = 'DEACTIVATION_WARNING' 
       AND triggered_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [userId]
    );

    if (recentWarnings.length === 0) {
      // Send warning
      await pool.promise().query(
        `INSERT INTO re_engagement_funnel 
         (user_id, stage) 
         VALUES (?, 'DEACTIVATION_WARNING')`,
        [userId]
      );

      // Schedule deactivation check
      setTimeout(async () => {
        const [warning] = await pool.promise().query(
          `SELECT * FROM re_engagement_funnel 
           WHERE user_id = ? 
           AND stage = 'DEACTIVATION_WARNING' 
           AND action_taken = FALSE 
           AND triggered_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
          [userId]
        );

        if (warning.length > 0) {
          // Deactivate account
          await pool.promise().query(
            `UPDATE users SET status = 'deactivated' WHERE id = ?`,
            [userId]
          );

          // Record deactivation
          await pool.promise().query(
            `INSERT INTO re_engagement_funnel 
             (user_id, stage) 
             VALUES (?, 'DEACTIVATED')`,
            [userId]
          );
        }
      }, 7 * 24 * 60 * 60 * 1000); // Check after 7 days
    }
  } catch (error) {
    console.error(`Error checking deactivation warning for user ${userId}:`, error);
  }
};

// Start the scheduler
scheduleEngagementUpdates();

module.exports = {
  scheduleEngagementUpdates,
  runDailyEngagementTasks
}; 
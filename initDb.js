const pool = require('./db');
const bcrypt = require('bcrypt');

const initializeDatabase = async () => {
  try {
    // Create users table if it doesn't exist
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        token_created_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table initialized');

    // Create users_verification_history table if it doesn't exist
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS users_verification_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Verification history table initialized');

    // Create services table if it doesn't exist
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        offer TEXT,
        seek TEXT,
        deadline DATE,
        file_path VARCHAR(255),
        service_type VARCHAR(50),
        location VARCHAR(255),
        status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
        rating DECIMAL(3,2) DEFAULT 0,
        reviews_count INT DEFAULT 0,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Services table initialized');

    // Create favorites table if it doesn't exist
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        service_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (user_id, service_id)
      )
    `);
    console.log('✅ Favorites table initialized');

    // Create reviews table if it doesn't exist
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Reviews table initialized');

    // Create service_offers table if it doesn't exist
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS service_offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        user_id INT NOT NULL,
        offer_details TEXT NOT NULL,
        proposed_deadline DATE NOT NULL,
        status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Service offers table initialized');

    // Create user_engagement_scores table
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS user_engagement_scores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        engagement_score INT DEFAULT 100,
        profile_completion_percentage INT DEFAULT 0,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_service_post TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create user_engagement_history table
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS user_engagement_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        score_change INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create re_engagement_funnel table
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS re_engagement_funnel (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        stage VARCHAR(50) NOT NULL,
        triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create ai_matchmaking_suggestions table
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS ai_matchmaking_suggestions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        suggested_service_id INT NOT NULL,
        match_score FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (suggested_service_id) REFERENCES services(id)
      )
    `);

    // Create missed_opportunities_digest table
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS missed_opportunities_digest (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        service_ids JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Insert sample users if they don't exist
    const sampleUsers = [
      { username: 'john_doe', email: 'john@example.com', password: 'password123', role: 'user' },
      { username: 'jane_smith', email: 'jane@example.com', password: 'password123', role: 'user' }
    ];

    for (const user of sampleUsers) {
      const hash = await bcrypt.hash(user.password, 10);
      await pool.promise().query(
        'INSERT IGNORE INTO users (username, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, true)',
        [user.username, user.email, hash, user.role]
      );
    }
    console.log('✅ Sample users added');

    // Get user IDs for sample data
    const [users] = await pool.promise().query('SELECT id FROM users WHERE username IN (?, ?)', ['john_doe', 'jane_smith']);
    const johnId = users[0].id;
    const janeId = users[1].id;

    // Insert sample services if they don't exist
    const sampleServices = [
      {
        user_id: johnId,
        title: 'Web Development Services',
        description: 'Professional web development using React and Node.js',
        category: 'Development',
        offer: 'Full-stack web development',
        seek: 'UI/UX design services',
        location: 'Remote',
        service_type: 'Technical'
      },
      {
        user_id: janeId,
        title: 'Graphic Design Services',
        description: 'Creative graphic design for all your needs',
        category: 'Design',
        offer: 'Logo and brand design',
        seek: 'Content writing services',
        location: 'Remote',
        service_type: 'Creative'
      }
    ];

    for (const service of sampleServices) {
      await pool.promise().query(
        `INSERT IGNORE INTO services 
        (user_id, title, description, category, offer, seek, location, service_type, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [service.user_id, service.title, service.description, service.category, 
         service.offer, service.seek, service.location, service.service_type]
      );
    }
    console.log('✅ Sample services added');

    console.log('All engagement tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase(); 
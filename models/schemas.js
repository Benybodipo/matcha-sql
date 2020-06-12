const db = 'CREATE DATABASE IF NOT EXISTS matcha CHARACTER SET utf8 COLLATE utf8_general_ci;';

const users = `CREATE TABLE IF NOT EXISTS users ( 
	id bigint(20) AUTO_INCREMENT NOT NULL , 
	first_name VARCHAR(255) NOT NULL, 
	last_name VARCHAR(255) NOT NULL, 
	username VARCHAR(255) NOT NULL, 
	email VARCHAR(191) UNIQUE NOT NULL, 
	password VARCHAR(191) NOT NULL, 
	gender VARCHAR(191) NOT NULL, 
	birthday date NOT NULL,
	age int(3) NULL,
	active int(1) DEFAULT 0,
    bio text NULL DEFAULT NULL,
	location text NULL DEFAULT NULL,
    PRIMARY KEY(id)
);`;
    
const chats = `CREATE TABLE IF NOT EXISTS chats ( 
	id bigint(20) AUTO_INCREMENT NOT NULL , 
	sender bigint(20) NOT NULL, 
	receiver bigint(20) NOT NULL, 
    username VARCHAR(255) NOT NULL,
    timestamp timestamp DEFAULT NOW(),
    PRIMARY KEY(id),
    FOREIGN KEY (sender) REFERENCES users(id),
    FOREIGN KEY (receiver) REFERENCES users(id)
);`;

const likes = `CREATE TABLE IF NOT EXISTS likes ( 
	id bigint(20) AUTO_INCREMENT NOT NULL,  
	liker bigint(20) NOT NULL, 
	liked bigint(20) NOT NULL, 
    username VARCHAR(255) NOT NULL,
    matched int(1) DEFAULT 0,
    timestamp timestamp DEFAULT NOW(),
    PRIMARY KEY(id),
    FOREIGN KEY (liker) REFERENCES users(id),
    FOREIGN KEY (liked) REFERENCES users(id)
);`;

const links = `CREATE TABLE IF NOT EXISTS links ( 
	id bigint(20) AUTO_INCREMENT NOT NULL , 
    user_id bigint(20) NOT NULL, 
    token VARCHAR(255) NOT NULL,
    type int(1) NOT NULL,
    timestamp timestamp DEFAULT NOW(),
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);`;

const messages = `CREATE TABLE IF NOT EXISTS messages ( 
	id bigint(20) AUTO_INCREMENT NOT NULL , 
	sender bigint(20) NOT NULL, 
	receiver bigint(20) NOT NULL, 
    message text NOT NULL,
    _read int(1) NOT NULL DEFAULT 0,
    sent_at timestamp DEFAULT NOW(),
    read_at timestamp NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (sender) REFERENCES users(id),
    FOREIGN KEY (receiver) REFERENCES users(id)
);`;

const notifications = `CREATE TABLE IF NOT EXISTS notifications ( 
	id bigint(20) AUTO_INCREMENT NOT NULL , 
	sender bigint(20) NOT NULL, 
	receiver bigint(20) NOT NULL,  
    message VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    _read int(1) NOT NULL DEFAULT 0,
    type int(3) NOT NULL,
    sent_at timestamp DEFAULT NOW(),
    read_at timestamp NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (sender) REFERENCES users(id),
    FOREIGN KEY (receiver) REFERENCES users(id)
);`;

const preferences = `CREATE TABLE IF NOT EXISTS preferences ( 
	id bigint(20) AUTO_INCREMENT NOT NULL ,
	user_id bigint(20) NOT NULL ,
    gender int(1) NULL,
    distance int(1) NULL,
    min_age int(4) NOT NULL,
    max_age int(4) NOT NULL,
    visible int(1) NOT NULL DEFAULT 0,
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);`;

const images = `CREATE TABLE IF NOT EXISTS images ( 
	id bigint(20) AUTO_INCREMENT NOT NULL ,
    user_id bigint(20) NOT NULL ,
    image text NOT NULL,
	is_profile_picture int(1) NOT NULL DEFAULT 0 ,
    created_at timestamp DEFAULT NOW(),
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);`;

const interests = `CREATE TABLE IF NOT EXISTS interests ( 
	id bigint(20) AUTO_INCREMENT NOT NULL ,
    name varchar(155) NOT NULL ,
    class varchar(155) NOT NULL ,
    PRIMARY KEY(id)
);`;

const user_interests = `CREATE TABLE IF NOT EXISTS user_interests ( 
	id bigint(20) AUTO_INCREMENT NOT NULL ,
    user_id bigint(20) NOT NULL ,
    interest_id bigint(20) NOT NULL,
    active int(1) NOT NULL DEFAULT 0,
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (interest_id) REFERENCES interests(id)
);`;
  


module.exports = {
    db: db,
    users: users,
    chats: chats,
    likes: likes,
    links: links,
    messages:messages,
    notifications: notifications,
    preferences: preferences,
    images: images,
    interests: interests,
    user_interests: user_interests
};
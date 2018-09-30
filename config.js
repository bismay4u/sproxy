const packageConfig = require('./package.json');

module.exports = {
	name: packageConfig.title,
	version: packageConfig.version,
	packageid: packageConfig.name,
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 9090,
	data_folder: "./mockdata/",
	base_url: process.env.BASE_URL || 'http://localhost:9000',
	cache : {
		host: '127.0.0.1',   // Redis host
		port: 6379,          // Redis port
		family: 4,           // 4 (IPv4) or 6 (IPv6)
		//password: 'auth',
		db: 0
	},
	throttle: {
		burst: 10,  // Max 10 concurrent requests (if tokens)
		rate: 0.5,  // Steady state: 1 request / 2 seconds
		ip: true,   // throttle per IP
		overrides: {
			'localhost': {
				burst: 0,
				rate: 0    // unlimited
			}
		}
	}
};
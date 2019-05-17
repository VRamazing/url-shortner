const config = {
  user: 'vignesh',
  password: 'admin12',
  db: 'urls',
  dbUrl: ''
}

config.dbUrl = `mongodb://${config.user}:${config.password}@ds161335.mlab.com:61335/${config.db}`

module.exports =  config;
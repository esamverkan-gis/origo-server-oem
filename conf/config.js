module.exports = {
  getInskrivning: {
    url: 'https://services-ver.lantmateriet.se/distribution/produkter/inskrivning/v2.1',
    user: 'xxxxx',
    password: 'xxxxx'
  },
  proxy: {
    proxyUrl: 'proxy?url='
  },
  'lmproxy-ver': {
    url: "http://maps-ver.lantmateriet.se/",
    auth: {
      user: 'xxxxx',
      pass: 'xxxxx'
    }
  },
  lmproxy: {
    url: "http://maps.lantmateriet.se/",
    auth: {
      user: 'xxxxx',
      pass: 'xxxxx'
    }
  },
  mapState: {
    'storagePath': './../OrigoMapState'
  }, 
  adminDataBase: {
    // Will be used in the file OrigoServer/admin/models.js to point to the database, but the strange is that it starts from root of OrigoServer
  	'relativePath' : './../OrigoDataBase/OrigoDataBase.db'
  }
}
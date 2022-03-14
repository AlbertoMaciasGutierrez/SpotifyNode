// app.js
const express = require("express");
const app = express();
const router = express.Router();
const hbs = require("hbs");
const path = require("path");
const bodyParser = require("body-parser");
var SpotifyWebApi = require("spotify-web-api-node");
var inicioSesionIncorrecto = false;

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);

var spotifyApi = new SpotifyWebApi({
  clientId: "f086f80d5c7b440eb2db5b91e845632a",
  clientSecret: "ebaff6ae35374250aeaabb3d6068daa3",
  redirectUri: "http://localhost:3000/callback",
});

//---------------------GENERAR TOKEN-------------------------------------//
// Retrieve an access token.
spotifyApi.clientCredentialsGrant().then(
  function (data) {
    console.log("The access token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"]);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body["access_token"]);
  },
  function (err) {
    console.log("Something went wrong when retrieving an access token", err);
  }
);
//--------------------------------------------------------------------//

router.get("/spotify", (req, res, next) => {
  res.redirect(
    spotifyApi.createAuthorizeURL([
      "ugc-image-upload",
      "user-read-recently-played",
      "user-read-playback-state",
      "user-top-read",
      "app-remote-control",
      "playlist-modify-public",
      "user-modify-playback-state",
      "playlist-modify-private",
      "user-follow-modify",
      "user-read-currently-playing",
      "user-follow-read",
      "user-library-modify",
      "user-read-playback-position",
      "playlist-read-private",
      "user-read-email",
      "user-read-private",
      "user-library-read",
      "playlist-read-collaborative",
      "streaming",
    ])
  );
});

const getMe = () => {
  spotifyApi.getMe().then(
    function (data) {
      console.log("Some information about the authenticated user", data.body);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
};

//getMe() 31wq7myc3b4h3d5cdvetpvnelt3y

/*const searchArtist = async () => {
  const artists = await spotifyApi.searchArtists("Extremo");
  //console.log("artist", artists);
  //console.log(`bilgiler`, artists.body.artists.items[0]);
};*/

//---------------------BUSQUEDA ALEATORIA-------------------------------------// 
// https://perryjanssen.medium.com/getting-random-tracks-using-the-spotify-api-61889b0c0c27
function getRandomSearch() {
  // Una lista de todos los caracteres que se pueden elegir
  const characters = "abcdefghijklmnopqrstuvwxyz";

  // Obtiene un carácter aleatorio de la cadena de caracteres
  const randomCharacter = characters.charAt(
    Math.floor(Math.random() * characters.length)
  );
  let randomSearch = "";

  // Coloca el carácter comodín al principio, o al principio y al final, al azar
  switch (Math.round(Math.random())) {
    case 0:
      randomSearch = randomCharacter + "%";
      break;
    case 1:
      randomSearch = "%" + randomCharacter + "%";
      break;
  }

  return randomSearch;
}
//---------------------------------------------------------------------------------//

app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/iniciarSesion", (req, res, next) => {
  inicioSesionIncorrecto = false
  res.render("iniciarSesion",{inicioSesionIncorrecto});
});

app.post("/iniciarSesion", (req, res, next) => {
  let fEmail = req.body.falseEmail;
  let fPass = req.body.falsePass;

  if (fEmail === "pepe@pepe.com" && fPass === "1234") {
    console.log("Ha iniciado sesion correctamente");
    res.render("index");
  } else {
    console.log("ERROR: NO ha iniciado sesion correctamente");
    inicioSesionIncorrecto = true;
    res.render("iniciarSesion",{inicioSesionIncorrecto});
  }
});

/*
app.use(fakeLogin);

function fakeLogin(req, res, next){
  console.log("Ha entrado en el Middleware");

  req.valoresSesion = req.body;
  

  if(req.fEmail === "pepe@pepe.com" && req.fPass === "1234" ){
    console.log("Ha iniciado sesion correctamente");
  }else{
    console.log("ERROR: NO ha iniciado sesion correctamente");
  }
  next();
}*/

app.get("/users/:username", (req, res) => {
  res.send(req.params);
});

app.get("/books/:bookId", (req, res, next) => {
  res.send(req.params);
});

app.get("/artistasAleatorios", (req, res, next) => {
  let busquedaAleatoria = getRandomSearch();
  //console.log(busquedaAleatoria);

  spotifyApi.searchArtists(busquedaAleatoria, { limit: 50, offset: 50 }).then(
    function (data) {
      let artistas = data.body.artists.items;
      res.render("artistasAleatorios", { artistas });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get("/artista", (req, res, next) => {
  let artista = req.query.search;

  //console.log(artista);

  spotifyApi.searchArtists(artista).then(
    function (data) {
      let artistas = data.body.artists.items;
      res.render("artistaBusqueda", { artistas, artista });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get("/artista/:artistaId", (req, res, next) => {
  let artistaSelecionado = req.params.artistaId;
  console.log(req.params.artistaId);
  
  spotifyApi.getArtist(artistaSelecionado)
  .then(function(data) {
    //console.log('Artist information', data.body);
    let artista = data.body;

    spotifyApi.getArtistTopTracks(artistaSelecionado, 'GB')
    .then(function(data) {
    //console.log(data.body);
    let topCanciones = data.body.tracks;
    res.render('artistaInfo', { artista,topCanciones });
    
    spotifyApi.getArtistAlbums(artistaSelecionado,{ limit: 5, offset: 5 })
    .then(function(data) {
    console.log('Artist albums', data.body);
    }, function(err) {
    console.error(err);
    });

    }, function(err) {
    console.log('Something went wrong!', err);
  });



  }, function(err) {
    console.error(err);
  });
});

app.get("/*", (request, response, next) => {
  let dataNotFound = {
    notFoundImage:
      "https://ih1.redbubble.net/image.373649743.0630/flat,750x,075,f-pad,750x1000,f8f8f8.u6.jpg",
  };
  response.render("404", dataNotFound);
});

app.listen(3000, () => console.log("App listening on port 3000!"));

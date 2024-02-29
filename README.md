# Netflix Reproduction Project
This project aims to reproduce the Netflix template (updated a few years ago) and its main functionalities. It starts with a simulated login function, where you can access using the following credentials:

- Email: "marcomilza@gmail.com"
- Password: "xxx"

After login, users are directed to the main screen, which features:
- Search bar
- Interstellar background as the current title
- List of highly sought-after movie titles
- List of highly sought-after TV show titles

Users can choose between series and movies by clicking on the poster or perform a search using the search bar, which displays a list of titles matching the entered letters sequence. This data is fetched from the server via an API call.

Once clicked on the content of interest, a screen opens displaying detailed information about the show: including a cover image and plot synopsis. From this point, users can access the movie itself with a single click (unfortunately replaced by its trailer for copyright reasons 😄).

Additionally, there is a feature to add titles to favorites for both movies and TV shows, and to rate them with stars.

## Technical Specifications
The project is developed using only front-end technologies. A RESTful API was used, pointing to a public service. The backend (database and data processing requested via API) was not under my control.

## Technologies Used
- Vue.js
- Vuex
- JavaScript
- HTML
- SCSS
- CSS

## Additional Notes
The project dates back to my learning period. Therefore, it was developed using an older version of Vue and may not reflect my current skills regarding TypeScript integration, code flexibility and reusability, syntax optimization, and file organization for improved readability and organization.


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

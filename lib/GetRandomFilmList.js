module.exports = (filmList, birinciKategori, ikinciKategori) => {
	let filteredList;

	if (birinciKategori && ikinciKategori) {
		filteredList = filmList.filter((film) => {
			return (
				film.genre.includes(birinciKategori) &&
				film.genre.includes(ikinciKategori)
			);
		});
	} else if (birinciKategori && !ikinciKategori) {
		filteredList = filmList.filter((film) => {
			return film.genre.includes(birinciKategori);
		});
	} else if (!birinciKategori && ikinciKategori) {
		filteredList = filmList.filter((film) => {
			return film.genre.includes(ikinciKategori);
		});
	} else {
		filteredList = filmList;
	}

	const randomFilmList = [];
	const randomFilmListLength = 3;
	let selectedFilmIndex;
	let i = 0;

	while (i < randomFilmListLength) {
		selectedFilmIndex = Math.floor(Math.random() * filteredList.length);
		if (filteredList[selectedFilmIndex].title) {
			randomFilmList.push(filteredList[selectedFilmIndex]);
			filteredList.splice(selectedFilmIndex, 1);
			i++;
		}
	}

	return randomFilmList;
};

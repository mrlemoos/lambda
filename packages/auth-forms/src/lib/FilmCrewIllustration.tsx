import filmCrewSrc from './film-crew.png';

import { importedImageSrc } from './importedImageSrc.js';

export function FilmCrewIllustration() {
  return (
    <img
      src={importedImageSrc(filmCrewSrc)}
      alt="Film crew with a camera"
      width={1536}
      height={1024}
      className="h-full min-h-svh w-full object-cover"
    />
  );
}

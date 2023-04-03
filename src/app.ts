import { songInput, songNamesEditor, artworkInput, progress, grid } from "./dom.js";
import { generateThumbnail } from "./thumbnail.js";
import type { Tags, PictureType } from "./jsmediatags.js";

// Test #1

// const audio = await fetch(new URL("../test/26.m4a",import.meta.url))
// .then(response => response.blob());

// const images = await runGenerator(audio,audio,audio,audio);
// console.log(images);

// Test #2

// const picture = await fetch(new URL("../test/Artwork.jpg",import.meta.url))
// .then(response => response.blob())
// .then(async blob => {
//   const { type: format } = blob;
//   const data = await blob.arrayBuffer()
//   .then(buffer => [...new Uint8Array(buffer)]);
//   return { format, data } as PictureType;
// });

// const tags = {
//   title: "zz: the lion stink breatH",
//   artist: "rBnaodn",
//   album: "(FORTRAN)",
//   picture
// } as Tags;

// const images = await runGenerator(tags);
// console.log(images);

// Test #3

// songNamesEditor.value = `[
//   {
//     "title": "zz: the lion stink breatH",
//     "artist": "rBnaodn",
//     "album": "(FORTRAN)"
//   }
// ]`;

// // Picture constant from Test 2

// const songTags = JSON.parse(songNamesEditor.value) as SongTags;
// console.log(...songTags);

// for (const tags of songTags){
//   tags.picture = picture;
// }

// const images = await runGenerator(...songTags);
// console.log(images);

// Test #4

// songNamesEditor.value = JSON.stringify([
//   {
//     title: "gg, za",
//     artist: "noice",
//     album: "fartface AAAgh"
//   },
//   {
//     title: "not that one",
//     artist: "gooof",
//     album: "a different one"
//   }
// ],null,2);

export type SongTags = Tags[];

songInput.addEventListener("change",async ({ target }) => {
  if (!(target instanceof HTMLInputElement)) return;

  const files = target.files!;

  const thumbnails = await runGenerator(...files);
  console.log(thumbnails);

  target.value = "";
});

artworkInput.addEventListener("change",async function(){
  const [file] = this.files!;
  console.log(file);

  const picture = await file.arrayBuffer()
  .then(buffer => {
    const { type: format } = file;
    const data = [...new Uint8Array(buffer)];
    return { format, data } as PictureType;
  });

  const songTags = JSON.parse(songNamesEditor.value) as SongTags;
  console.log(...songTags);
  
  for (const tags of songTags){
    tags.picture = picture;
  }
  
  const images = await runGenerator(...songTags);
  console.log(images);

  this.value = "";
});

/**
 * Runs the thumbnail generator over an array of song files, or song artwork and metadata.
*/
async function runGenerator(...songs: (Blob | Tags)[]){
  const thumbnails: Blob[] = [];

  document.body.dataset.running = "";
  progress.value = 0;
  progress.max = songs.length;

  for (let i = 0; i < songs.length; i++){
    const song = songs[i];
    const thumbnail = await generateThumbnail(song);
    makeCard(thumbnail);
    thumbnails.push(thumbnail);
    progress.value = i + 1;
  }

  progress.removeAttribute("value");
  delete document.body.dataset.running;

  return thumbnails;
}

async function makeCard(thumbnail: Blob){
  const image = new Image();
  const link = URL.createObjectURL(thumbnail);

  await new Promise((resolve,reject) => {
    image.addEventListener("load",resolve,{ once: true });
    image.addEventListener("error",reject,{ once: true });
    image.src = link;
  });

  // Can't right-click and download the thumbnail if the Object URL has already been revoked.
  // URL.revokeObjectURL(link);
  grid.append(image);
}

function saveFile(data: File){
  const anchor = document.createElement("a");
  const link = URL.createObjectURL(data);
  anchor.download = link;
  anchor.click();
  URL.revokeObjectURL(link);
}
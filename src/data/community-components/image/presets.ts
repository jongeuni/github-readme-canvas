import type { PresetDefinition } from '../../../types/library';
import type { ImageSettings } from './types';

/**
 * Presets for the "Line" entry (see component.ts) — a few decorative divider
 * GIFs, curated from repos people already use them from (verified live
 * before adding). Not meant to be exhaustive, and not user-extensible via a
 * URL field (Line is variant-only) — "Image"/"GIF" are the entries for
 * pasting any URL.
 */
export const linePresets: PresetDefinition<ImageSettings>[] = [
  {
    id: 'img-line-neon',
    name: 'Neon Line',
    settings: { url: 'https://raw.githubusercontent.com/AnderMendoza/AnderMendoza/main/assets/line-neon.gif', width: '100%' },
  },
  {
    id: 'img-line-fading',
    name: 'Fading Line',
    settings: { url: 'https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif', width: '100%' },
  },
  {
    id: 'img-line-gradient',
    name: 'Gradient Line',
    settings: { url: 'https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif', width: '100%' },
  },
];

/**
 * Presets for the "Animal GIFs" entry (see component.ts) — a small curated
 * set of cat/dog/hamster/etc. reaction GIFs, hosted on Giphy's media CDN
 * (each URL verified to serve image/gif before adding). Unlike Line, these
 * are NOT variant-only: width/alt/link stay editable after picking one.
 */
export const animalGifPresets: PresetDefinition<ImageSettings>[] = [
  {
    id: 'img-animal-cat-hello',
    name: 'White Cat Hello',
    settings: { url: 'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif', width: '300px', alt: 'White Cat Hello' },
  },
  {
    id: 'img-animal-cat-cute',
    name: 'Cute Kitty',
    settings: { url: 'https://media.giphy.com/media/uyfgCPQeCjYMVxt2m3/giphy.gif', width: '300px', alt: 'Cute Kitty' },
  },
  {
    id: 'img-animal-cat-playing',
    name: 'Playing Cat',
    settings: { url: 'https://media.giphy.com/media/jkAs9C3OoA9Nu/giphy.gif', width: '300px', alt: 'Playing Cat' },
  },
  {
    id: 'img-animal-cat-working',
    name: 'Working Cat',
    settings: { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', width: '300px', alt: 'Working Cat' },
  },
  {
    id: 'img-animal-dog-happy',
    name: 'Happy Dog',
    settings: { url: 'https://media.giphy.com/media/QvBoMEcQ7DQXK/giphy.gif', width: '300px', alt: 'Happy Dog' },
  },
  {
    id: 'img-animal-dog-golden',
    name: 'Golden Retriever',
    settings: { url: 'https://media.giphy.com/media/SkhmXuwhVfwx1jBQhX/giphy.gif', width: '300px', alt: 'Golden Retriever' },
  },
  {
    id: 'img-animal-dog-cute',
    name: 'Cute Dog',
    settings: { url: 'https://media.giphy.com/media/nLkYoleEY5iJW/giphy.gif', width: '300px', alt: 'Cute Dog' },
  },
  {
    id: 'img-animal-dog-shiba',
    name: 'Shiba Inu',
    settings: { url: 'https://media.giphy.com/media/aVu4KgHEVFG1i/giphy.gif', width: '300px', alt: 'Shiba Inu' },
  },
  {
    id: 'img-animal-hamster-munch',
    name: 'Hamster',
    settings: { url: 'https://media.giphy.com/media/Oc8lIQHZsXqDu/giphy.gif', width: '300px', alt: 'Hamster' },
  },
  {
    id: 'img-animal-hamster-cute',
    name: 'Cute Hamster',
    settings: { url: 'https://media.giphy.com/media/wZ2SI2e3t1gR2/giphy.gif', width: '300px', alt: 'Cute Hamster' },
  },
  {
    id: 'img-animal-hamster-burger',
    name: 'Burger Hamster',
    settings: { url: 'https://media.giphy.com/media/5CFjtTwqWAB7Vg6yNr/giphy.gif', width: '300px', alt: 'Burger Hamster' },
  },
  {
    id: 'img-animal-bunny',
    name: 'Bunny',
    settings: { url: 'https://media.giphy.com/media/wsJHi6a1JwoXC/giphy.gif', width: '300px', alt: 'Bunny' },
  },
  {
    id: 'img-animal-duck',
    name: 'Ducks',
    settings: { url: 'https://media.giphy.com/media/9vzk5JCmTBPfa/giphy.gif', width: '300px', alt: 'Ducks' },
  },
  {
    id: 'img-animal-panda',
    name: 'Panda',
    settings: { url: 'https://media.giphy.com/media/Hs6f36KUBjWww/giphy.gif', width: '300px', alt: 'Panda' },
  },
  {
    id: 'img-animal-penguin',
    name: 'Running Penguin',
    settings: { url: 'https://media.giphy.com/media/H4uE6w9G1uK4M/giphy.gif', width: '300px', alt: 'Running Penguin' },
  },
  {
    id: 'img-animal-capybara',
    name: 'Capybara',
    settings: { url: 'https://media.giphy.com/media/hi2kPofVMW70k/giphy.gif', width: '300px', alt: 'Capybara' },
  },
  {
    id: 'img-animal-fox',
    name: 'Red Fox',
    settings: { url: 'https://media.giphy.com/media/B1xlEHtKiFM9W/giphy.gif', width: '300px', alt: 'Red Fox' },
  },
  {
    id: 'img-animal-raccoon',
    name: 'Clapping Raccoon',
    settings: { url: 'https://media.giphy.com/media/zfNAMCrhSQzte/giphy.gif', width: '300px', alt: 'Clapping Raccoon' },
  },
  {
    id: 'img-animal-otter',
    name: 'Otter',
    settings: { url: 'https://media.giphy.com/media/bNBAQpqb4MSnS/giphy.gif', width: '300px', alt: 'Otter' },
  },
  {
    id: 'img-animal-hedgehog',
    name: 'Hedgehog',
    settings: { url: 'https://media.giphy.com/media/BKLKoUfdBeRG0/giphy.gif', width: '300px', alt: 'Hedgehog' },
  },
];

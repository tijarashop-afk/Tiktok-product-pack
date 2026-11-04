# Studio Vidéo — pipeline HyperFrames

Ce dossier est isolé des fichiers existants du site TikTok. Aucune modification du site, de ses médias ou de sa configuration GitHub Pages.

## Test

La composition `index.html` est un test graphique de **6 secondes**, **1080 × 1920**, **30 images/s**, sans voix ni musique. Elle sert uniquement à vérifier l'installation et le moteur de rendu HyperFrames **0.9.12** sur GitHub Actions. Elle n'est pas une vidéo définitive « Partage et Sourire ».

## Installation locale

- Node.js 22 ou supérieur et FFmpeg.
- Depuis ce dossier : `npm install`, puis `npx hyperframes browser ensure`.
- Contrôle : `npx hyperframes lint` et `npx hyperframes check`.
- Export : `mkdir -p renders && npx hyperframes render --output renders/studio-video-test.mp4`.

## GitHub Actions

Le workflow `.github/workflows/studio-video-hyperframes.yml` installe HyperFrames depuis npm sur un runner Linux, effectue le lint, vérifie le rendu avec ffprobe/ffmpeg et publie le MP4 en **artifact** téléchargeable depuis la page du run.

Le workflow peut être déclenché manuellement depuis l'onglet **Actions** après son intégration sur la branche principale. Sur la branche de préparation, le push est configuré pour lancer un premier test sans toucher au déploiement du site.

## Règles de production Studio Vidéo

- Format vertical 9:16, 1080 × 1920 et 30 fps par défaut.
- Voix off masculine française fournie sur piste séparée. **Aucune musique, aucun jingle**.
- Bruitages synchronisés et mesurés ; respecter le logo et les visuels fournis.
- Trois miniatures proposées pour chaque nouvelle vidéo TikTok, couverture choisie en ouverture 1 seconde.
- Remotion reste disponible pour les projets qui l'exigent ; HyperFrames est une option de rendu, pas un remplacement forcé.
- Ne pas publier de fichiers audio, de photos personnelles ou de coordonnées privées dans ce dépôt **public** sans vérification de leur diffusion autorisée.
- Ne jamais annoncer un rendu « réussi » avant qu'un GitHub Actions run ne soit terminé avec succès et que son artefact MP4 ait été contrôlé.

Documentation : https://github.com/heygen-com/hyperframes

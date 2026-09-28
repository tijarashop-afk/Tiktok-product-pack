# TikTok Veo Pack

Application mobile-first pour préparer rapidement un pack TikTok à partir d’une photo produit et d’un titre fourni par le vendeur.

## Fonctionnement

1. Saisir le titre du produit.
2. Ajouter une photo.
3. Copier l’instruction d’analyse et l’envoyer avec la photo dans ChatGPT.
4. Coller l’analyse obtenue dans l’application.
5. Générer 3 prompts Veo de 8 secondes.
6. Copier chaque prompt dans les fonctionnalités vidéo Google basées sur Veo, puis assembler les 3 clips.

## Règles permanentes

- aucun prix demandé, affiché ou inventé
- aucune marque, matière, dimension, fonction ou promesse inventée
- le titre fourni par le vendeur peut être utilisé comme nom, sans en déduire d’autres caractéristiques
- 3 clips verticaux 9:16 de 8 secondes
- voix off française prévue dans chaque prompt
- aucune musique, aucun jingle, aucune bande-son musicale
- objectif prioritaire : arrêt du scroll, rétention, commentaires, abonnements
- CTA final : « Disponible sur mon stand et sur Vinted — abonne-toi pour découvrir mes prochains produits ! »
- légende TikTok + exactement 5 hashtags

## Contrôles automatiques

L’application vérifie avant utilisation :

- 3 clips de 8 secondes
- absence de prix
- absence de musique
- longueur raisonnable de la voix off
- format vertical 9:16
- 5 hashtags
- présence du CTA stand + Vinted

## Viral Studio · HyperFrames

Après la génération des 3 prompts Veo, l'application prépare automatiquement un pack de post-production HyperFrames :

- brief de montage vertical 1080×1920 sur 24 secondes
- sous-titres dynamiques avec groupes courts et style TikTok
- plan TTS français pour Kokoro-82M via HyperFrames
- préécoute vocale française dans le navigateur via Web Speech
- effets dynamiques : karaoke mot par mot, emphases, marker highlights et transitions
- respect de la règle HyperFrames : entrées animées, pas de sortie avant transition
- export d'un manifeste JSON réutilisable par un pipeline HyperFrames
- copie du pack complet avec les prompts Veo, la légende, les hashtags et la configuration HyperFrames

Le site GitHub Pages reste entièrement statique : il prépare les scripts, timings estimés et configurations. Le rendu vidéo final, le TTS Kokoro et la transcription mot à mot sont exécutés dans un environnement HyperFrames.

## Historique

Les 12 derniers packs sont conservés localement sur l’appareil via `localStorage`. Aucune photo ni donnée n’est envoyée vers un serveur par le site lui-même.

## Déploiement

Le site est statique et déployé automatiquement avec GitHub Pages. Aucune clé API n’est stockée dans le code public.

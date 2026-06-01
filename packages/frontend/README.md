Structure d'organisation des frontends.

- `frontend/official` : wrapper qui redirige les commandes vers `packages/frontend-official`.
- `frontend/demo` : wrapper qui redirige les commandes vers `packages/frontend-demo`.

But: les sources originales restent dans `packages/frontend-official` et `packages/frontend-demo`.
Pour déplacer physiquement les sources sous `packages/frontend/official` ou `packages/frontend/demo`, exécuter manuellement un déplacement ou me demander de l'automatiser (cela impliquera de copier/mettre à jour un grand nombre de fichiers).

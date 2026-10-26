import { Router } from "express";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  updateRecipe,
} from "../services/recipeService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Express 4 does not forward rejected promises to the error handler on its own.
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.get(
  "/",
  wrap(async (req, res) => {
    const recipes = await listRecipes({ author: req.query.author });
    res.json({ count: recipes.length, recipes });
  })
);

router.get(
  "/:id",
  wrap(async (req, res) => {
    const recipe = await getRecipe(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
  })
);

router.post(
  "/",
  requireAuth,
  wrap(async (req, res) => {
    res.status(201).json(await createRecipe(req.body, req.userId));
  })
);

router.patch(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    res.json(await updateRecipe(req.params.id, req.userId, req.body));
  })
);

router.delete(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    await deleteRecipe(req.params.id, req.userId);
    res.status(204).end();
  })
);

export default router;

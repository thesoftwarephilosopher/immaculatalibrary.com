import { bookRoutes } from "../model/book";
import { allCategoryRoutes } from "../model/category";
import { movieRoutes } from "../model/movie";
import { allPageRoutes } from "../model/page";
import { postRoutes } from "../model/post";
import { snippetRoutes } from "../model/snippet";
import { adminPageRoutes, EnrichedInput } from "../pages/admin";
import { homeRoutes } from "../pages/home";
import { makeSitemap } from "./sitemap";
import { staticFileRoutes } from "./static";
import { RouteOutput } from "/src/http";

type AuthedRouteHandler = (input: EnrichedInput) => RouteOutput;

export interface Routeable {
  route: string;
  method: 'GET' | 'POST';
  handle: AuthedRouteHandler;
  lastModifiedDate?: Date;
}

const allRoutes = new Map<string, AuthedRouteHandler>();

const forSitemap: Routeable[] = [];

export function addRouteable(routeable: Routeable) {
  if (routeable.method === 'GET' && !routeable.route.startsWith('/admin')) {
    forSitemap.push(routeable);
  }

  addRoute(`${routeable.method} ${routeable.route}`, (input) => routeable.handle(input));
}

function addRoute(route: string, handler: AuthedRouteHandler) {
  if (allRoutes.has(route)) {
    throw new Error(`Duplicate route: ${route}`);
  }

  allRoutes.set(route, handler);
}

export function loadRoutes() {
  adminPageRoutes.forEach(addRouteable);
  staticFileRoutes.forEach(addRouteable);
  allCategoryRoutes.forEach(addRouteable);
  homeRoutes.forEach(addRouteable);
  allPageRoutes.forEach(addRouteable);
  postRoutes.forEach(addRouteable);
  snippetRoutes.forEach(addRouteable);
  movieRoutes.forEach(addRouteable);
  bookRoutes.forEach(addRouteable);

  addRouteable(makeSitemap(forSitemap));

  return allRoutes;
}

import { cors, sendJson } from "../server/lib/http.js";
import * as authLogin from "../server/lib/routes/auth-login.js";
import * as authSignup from "../server/lib/routes/auth-signup.js";
import * as authMe from "../server/lib/routes/auth-me.js";
import * as authLogout from "../server/lib/routes/auth-logout.js";
import * as content from "../server/lib/routes/content.js";
import * as votes from "../server/lib/routes/votes.js";
import * as editsIndex from "../server/lib/routes/edits-index.js";
import * as editsId from "../server/lib/routes/edits-id.js";
import * as postsIndex from "../server/lib/routes/posts-index.js";
import * as postsId from "../server/lib/routes/posts-id.js";
import * as postsSubmit from "../server/lib/routes/posts-submit.js";
import * as upload from "../server/lib/routes/upload.js";
import * as adminQueue from "../server/lib/routes/admin-queue.js";
import * as adminUsers from "../server/lib/routes/admin-users.js";
import * as contributors from "../server/lib/routes/contributors.js";
import * as elumiaItems from "../server/lib/routes/elumia-items.js";
import * as elumiaItemsId from "../server/lib/routes/elumia-items-id.js";

const staticRoutes = {
  "auth/login": authLogin,
  "auth/signup": authSignup,
  "auth/me": authMe,
  "auth/logout": authLogout,
  content,
  votes,
  edits: editsIndex,
  posts: postsIndex,
  upload,
  "admin/queue": adminQueue,
  "admin/users": adminUsers,
  contributors,
  "elumia/items": elumiaItems
};

function apiPath(req) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const fromQuery = url.searchParams.get("route");
  if (fromQuery) return fromQuery.replace(/\/$/, "");
  return url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const path = apiPath(req);
  const parts = path ? path.split("/") : [];

  const route = staticRoutes[path];
  if (route) return route.handle(req, res);

  if (parts.length === 2 && parts[0] === "edits") {
    return editsId.handle(req, res, parts[1]);
  }

  if (parts.length === 3 && parts[0] === "posts" && parts[2] === "submit") {
    return postsSubmit.handle(req, res, parts[1]);
  }

  if (parts.length === 2 && parts[0] === "posts") {
    return postsId.handle(req, res, parts[1]);
  }

  if (parts.length === 2 && parts[0] === "admin" && parts[1] === "users") {
    return adminUsers.handle(req, res);
  }

  if (parts.length === 3 && parts[0] === "admin" && parts[1] === "users") {
    return adminUsers.handle(req, res, parts[2]);
  }

  if (parts.length === 3 && parts[0] === "elumia" && parts[1] === "items") {
    return elumiaItemsId.handle(req, res, parts[2]);
  }

  return sendJson(res, 404, { error: "Not found." });
}

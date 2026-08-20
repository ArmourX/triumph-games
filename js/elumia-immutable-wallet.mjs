import { connectWallet, IMMUTABLE_ZKEVM_MAINNET } from "@imtbl/wallet";
import { Auth } from "@imtbl/auth";

export function getPassportRedirectUri(passportConfig) {
  if (passportConfig && passportConfig.redirectUri) {
    return passportConfig.redirectUri;
  }
  return window.location.origin + "/elumia-passport-callback";
}

export function getPassportLogoutUri(passportConfig) {
  if (passportConfig && passportConfig.logoutRedirectUri) {
    return passportConfig.logoutRedirectUri;
  }
  return window.location.origin + "/elumia-inventory";
}

export function createPassportAuth(passportConfig) {
  if (!passportConfig || !passportConfig.clientId) {
    throw new Error(
      "Immutable Passport client ID is not configured. Add passport.clientId to assets/elumia/imx-config.json after registering redirect URLs in Immutable Hub."
    );
  }

  var redirectUri = getPassportRedirectUri(passportConfig);

  return new Auth({
    clientId: passportConfig.clientId,
    redirectUri: redirectUri,
    popupRedirectUri: redirectUri,
    logoutRedirectUri: getPassportLogoutUri(passportConfig),
    audience: "platform_api",
    scope: "openid offline_access email transact",
  });
}

export async function connectImmutablePassport(passportConfig) {
  var auth = createPassportAuth(passportConfig);
  var chainId =
    passportConfig && passportConfig.chainId != null
      ? passportConfig.chainId
      : 13371;
  var connectOptions = Object.assign({}, IMMUTABLE_ZKEVM_MAINNET, {
    initialChainId: chainId,
    clientId: passportConfig.clientId,
    getUser: async function (forceRefresh) {
      if (forceRefresh) return auth.forceUserRefresh();
      return auth.getUserOrLogin();
    },
  });

  var provider = await connectWallet(connectOptions);
  var accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || !accounts.length) {
    throw new Error("Immutable Passport did not return a wallet address.");
  }
  return { provider: provider, address: accounts[0], auth: auth };
}

export async function completePassportCallback(passportConfig) {
  var auth = createPassportAuth(passportConfig);
  return auth.loginCallback();
}

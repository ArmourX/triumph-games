(function () {
  var RH_CHAIN = {
    chainId: "0xB626",
    chainName: "Robinhood Chain Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.testnet.chain.robinhood.com"],
    blockExplorerUrls: ["https://explorer.testnet.chain.robinhood.com"],
  };

  var els = {
    origin: document.getElementById("erc6551-origin"),
    metadataUrl: document.getElementById("erc6551-metadata-url"),
    imageUrl: document.getElementById("erc6551-image-url"),
    previewImage: document.getElementById("erc6551-preview-image"),
    previewName: document.getElementById("erc6551-preview-name"),
    previewDesc: document.getElementById("erc6551-preview-desc"),
    openMetadata: document.getElementById("erc6551-open-metadata"),
    traits: document.getElementById("erc6551-traits"),
    previewContext: document.getElementById("erc6551-preview-context"),
    tokenPicker: document.getElementById("erc6551-token-picker"),
    inventory: document.getElementById("erc6551-inventory"),
    inventoryNote: document.getElementById("erc6551-inventory-note"),
    inventoryRefresh: document.getElementById("erc6551-inventory-refresh"),
    status: document.getElementById("erc6551-status"),
    configRows: document.getElementById("erc6551-config-rows"),
    deploymentRows: document.getElementById("erc6551-deployment-rows"),
    holderCount: document.getElementById("erc6551-holder-count"),
    holdersList: document.getElementById("erc6551-holders-list"),
    holderSelect: document.getElementById("erc6551-holder-select"),
    recipientInput: document.getElementById("erc6551-recipient"),
    mintHeroBtn: document.getElementById("erc6551-mint-hero"),
    mintStarterBtn: document.getElementById("erc6551-mint-starter"),
    mintItemSelect: document.getElementById("erc6551-mint-item-select"),
    mintAmountInput: document.getElementById("erc6551-mint-amount"),
    mintItemBtn: document.getElementById("erc6551-mint-item-btn"),
    mintStatus: document.getElementById("erc6551-mint-status"),
    walletAddress: document.getElementById("erc6551-wallet-address"),
    walletBalance: document.getElementById("erc6551-wallet-balance"),
    connectBtn: document.getElementById("erc6551-connect"),
    headerConnectBtn: document.getElementById("erc6551-header-connect"),
    switchBtn: document.getElementById("erc6551-switch-network"),
  };

  var currentDeployment = null;
  var itemCatalog = null;
  var connectedAddress = null;
  var ownedTokenIds = [];
  var selectedTokenId = null;
  var holdersCache = [];
  var previewMode = "deployment";
  var refreshPreviewFn = null;

  var TESTER001_ABI = [
    "function mint(address to) returns (uint256)",
    "function owner() view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
  ];

  var ITEMS_ABI = [
    "function mintItem(address to, uint256 id, uint256 amount)",
    "function mintStarterPack(address to)",
    "function owner() view returns (address)",
    "function balanceOf(address account, uint256 id) view returns (uint256)",
  ];

  var REGISTRY_ABI = [
    "function account(address implementation, bytes32 salt, uint256 chainId, address tokenContract, uint256 tokenId) view returns (address)",
  ];

  function origin() {
    return window.location.origin;
  }

  function setText(el, value) {
    if (el) el.textContent = value || "—";
  }

  function addRow(container, label, value, href, description) {
    if (!container) return;
    var row = document.createElement("div");
    row.className = "erc6551-kv-row";
    var dt = document.createElement("dt");
    dt.textContent = label;
    if (description) {
      var desc = document.createElement("span");
      desc.className = "erc6551-kv-desc";
      desc.textContent = description;
      dt.appendChild(desc);
    }
    var dd = document.createElement("dd");
    if (href) {
      var a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = value;
      dd.appendChild(a);
    } else {
      dd.textContent = value;
    }
    row.appendChild(dt);
    row.appendChild(dd);
    container.appendChild(row);
  }

  function assetUrl(relativePath) {
    return "/assets/erc6551/" + String(relativePath || "").replace(/^\/+/, "");
  }

  function renderInventory(catalog, amounts) {
    if (!els.inventory) return;
    els.inventory.innerHTML = "";

    var hasAny = false;
    (catalog.items || []).forEach(function (item) {
      var amount = amounts[item.id];
      if (amount == null) amount = 0;
      if (amount > 0) hasAny = true;

      var card = document.createElement("article");
      card.className = "erc6551-item-card";

      var imageWrap = document.createElement("div");
      imageWrap.className = "erc6551-item-image";
      var img = document.createElement("img");
      img.src = assetUrl(item.image);
      img.alt = item.name;
      imageWrap.appendChild(img);

      var body = document.createElement("div");
      body.className = "erc6551-item-body";
      body.innerHTML =
        '<div class="erc6551-item-name">' + item.name + "</div>" +
        '<div class="erc6551-item-meta">' + item.category + " · " + item.rarity + "</div>" +
        '<div class="erc6551-item-effect">' + item.effect + "</div>";

      var qty = document.createElement("div");
      qty.className = "erc6551-item-qty";
      qty.textContent = "x" + amount;

      card.appendChild(imageWrap);
      card.appendChild(body);
      card.appendChild(qty);
      els.inventory.appendChild(card);
    });

    if (!hasAny) {
      els.inventory.innerHTML =
        '<p class="erc6551-empty-state">No items in this hero\'s token-bound account yet.</p>';
    }
  }

  function setPreviewContext(label, badgeType) {
    if (!els.previewContext) return;
    els.previewContext.textContent = label;
    els.previewContext.className = "erc6551-context-badge";
    if (badgeType === "wallet") {
      els.previewContext.classList.add("is-wallet");
    } else if (badgeType === "holder") {
      els.previewContext.classList.add("is-holder");
    }
  }

  function resetHolderSelect() {
    if (els.holderSelect) els.holderSelect.value = "";
  }

  function findHolderByAddress(address) {
    var target = String(address || "").toLowerCase();
    for (var i = 0; i < holdersCache.length; i++) {
      if (holdersCache[i].address.toLowerCase() === target) {
        return holdersCache[i];
      }
    }
    return null;
  }

  function formatHolderOptionLabel(holder) {
    var label = shortAddress(holder.address);
    if (holder.tokenIds.length === 1) {
      return label + " · Hero #" + holder.tokenIds[0];
    }
    return label + " · Heroes #" + holder.tokenIds.join(", #");
  }

  function populateHolderSelect(holders) {
    if (!els.holderSelect) return;
    var previous = els.holderSelect.value;
    els.holderSelect.innerHTML =
      '<option value="">Select a holder to preview…</option>';
    holders.forEach(function (holder) {
      var option = document.createElement("option");
      option.value = holder.address;
      option.textContent = formatHolderOptionLabel(holder);
      els.holderSelect.appendChild(option);
    });
    if (previous) {
      els.holderSelect.value = previous;
    }
  }

  function resolveAssetImage(imagePath) {
    if (!imagePath) return assetUrl("hero/trainer.png");
    if (imagePath.indexOf("http://") === 0 || imagePath.indexOf("https://") === 0) {
      return imagePath;
    }
    if (imagePath.indexOf("/assets/erc6551/") === 0) {
      return imagePath;
    }
    return assetUrl(String(imagePath).replace(/^\/+/, ""));
  }

  function renderHeroPreview(meta, tokenId, options) {
    options = options || {};
    if (els.previewImage) {
      els.previewImage.src = resolveAssetImage(meta.image);
      els.previewImage.alt = meta.name || "Tester001 hero";
    }
    setText(els.previewName, meta.name || "Tester001 #" + tokenId);
    setText(els.previewDesc, meta.description || "");
    renderTraits(meta.attributes || []);

    if (els.openMetadata) {
      var metadataHref =
        options.metadataUrl ||
        (meta.tokenURI ? meta.tokenURI : assetUrl(tokenId + ".json"));
      els.openMetadata.href = metadataHref;
    }
  }

  function showHeroEmptyState(message) {
    if (els.previewImage) {
      els.previewImage.src = assetUrl("hero/trainer.png");
      els.previewImage.alt = "Tester001 hero";
    }
    setText(els.previewName, "No hero NFT");
    setText(els.previewDesc, message);
    if (els.traits) els.traits.innerHTML = "";
    if (els.tokenPicker) {
      els.tokenPicker.hidden = true;
      els.tokenPicker.innerHTML = "";
    }
  }

  function renderTokenPicker(tokenIds, activeTokenId, onSelect) {
    if (!els.tokenPicker) return;
    if (!tokenIds || tokenIds.length <= 1) {
      els.tokenPicker.hidden = true;
      els.tokenPicker.innerHTML = "";
      return;
    }

    els.tokenPicker.hidden = false;
    els.tokenPicker.innerHTML = "";
    tokenIds.forEach(function (tokenId) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className =
        "erc6551-token-chip" +
        (String(tokenId) === String(activeTokenId) ? " is-active" : "");
      chip.textContent = "Hero #" + tokenId;
      chip.addEventListener("click", function () {
        onSelect(tokenId);
      });
      els.tokenPicker.appendChild(chip);
    });
  }

  async function loadJsonFromUri(uri) {
    var path = uri;
    if (uri.indexOf("http://") === 0 || uri.indexOf("https://") === 0) {
      var url = new URL(uri);
      path = url.pathname;
    }
    return loadJson(path);
  }

  async function loadHeroMetadata(tokenId, tokenUri) {
    try {
      var meta = await loadJsonFromUri(tokenUri);
      meta.tokenURI = tokenUri;
      return meta;
    } catch (err) {
      return {
        name: "Tester001 Hero #" + tokenId,
        description:
          "Tester001 hero NFT with an ERC-6551 token-bound account. Metadata file is not hosted yet; inventory still loads from chain.",
        image: "hero/trainer.png",
        attributes: [
          { trait_type: "Collection", value: "Tester001" },
          { trait_type: "Token ID", value: String(tokenId) },
        ],
        tokenURI: tokenUri,
      };
    }
  }

  async function appendTbaToInventoryNote(baseNote, tokenId) {
    if (!els.inventoryNote || !baseNote) return;
    try {
      var tbaAddress = await getTbaAddress(tokenId);
      els.inventoryNote.textContent =
        baseNote + " TBA: " + shortAddress(tbaAddress) + ".";
    } catch (err) {
      els.inventoryNote.textContent = baseNote;
    }
  }

  async function restoreDeploymentPreview() {
    ownedTokenIds = [];
    selectedTokenId = null;
    connectedAddress = null;
    previewMode = "deployment";
    await loadDeploymentHeroPreview();
  }

  async function loadDeploymentHeroPreview(tokenId) {
    tokenId =
      tokenId ||
      selectedTokenId ||
      (currentDeployment && currentDeployment.tokenId) ||
      "1";
    previewMode = "deployment";
    selectedTokenId = tokenId;
    resetHolderSelect();
    setPreviewContext("Deployment preview · Hero #" + tokenId, false);

    if (
      !currentDeployment ||
      currentDeployment.status !== "deployed" ||
      !currentDeployment.nft
    ) {
      if (els.inventoryNote) {
        els.inventoryNote.textContent =
          "Starter items minted into the token-bound account on deploy.";
      }
      try {
        var meta = await loadJson("/assets/erc6551/1.json");
        renderHeroPreview(meta, "1", {
          metadataUrl: "/assets/erc6551/1.json",
        });
      } catch (err) {
        showHeroEmptyState(err.message);
      }
      if (itemCatalog && currentDeployment) {
        renderInventory(itemCatalog, buildStarterAmounts(currentDeployment));
      }
      refreshPreviewFn = null;
      return;
    }

    if (els.inventoryNote) {
      els.inventoryNote.textContent =
        "Live on-chain inventory for hero #" +
        tokenId +
        "'s token-bound account.";
    }

    await loadHeroForToken(tokenId, {
      badgeType: false,
      contextLabel: "Deployment preview · Hero #" + tokenId,
      inventoryNote:
        "Live on-chain inventory for hero #" +
        tokenId +
        "'s token-bound account.",
    });

    refreshPreviewFn = function () {
      return loadDeploymentHeroPreview(selectedTokenId);
    };
  }

  async function refreshCurrentPreview() {
    if (els.inventoryRefresh) {
      els.inventoryRefresh.disabled = true;
      els.inventoryRefresh.classList.add("is-spinning");
    }

    try {
      if (refreshPreviewFn) {
        await refreshPreviewFn();
        return;
      }
      if (previewMode === "wallet" && connectedAddress && selectedTokenId) {
        await loadWalletHero(selectedTokenId);
      } else if (
        previewMode === "holder" &&
        els.holderSelect &&
        els.holderSelect.value
      ) {
        await loadHolderPreview(els.holderSelect.value, selectedTokenId);
      } else {
        await loadDeploymentHeroPreview(selectedTokenId);
      }
    } catch (err) {
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="erc6551-empty-state">' + err.message + "</p>";
      }
    } finally {
      if (els.inventoryRefresh) {
        els.inventoryRefresh.disabled = false;
        els.inventoryRefresh.classList.remove("is-spinning");
      }
    }
  }

  function buildStarterAmounts(deployment) {
    var amounts = {};
    (deployment.starterInventory || []).forEach(function (entry) {
      amounts[entry.id] = entry.amount;
    });
    return amounts;
  }

  async function getReadProvider() {
    if (!window.ethers) {
      throw new Error("Wallet tools failed to load. Refresh the page.");
    }
    if (window.ethereum) {
      var browserProvider = new window.ethers.BrowserProvider(window.ethereum);
      var network = await browserProvider.getNetwork();
      if (Number(network.chainId) === 46630) {
        return browserProvider;
      }
    }
    var rpcUrl =
      (currentDeployment && currentDeployment.rpc) ||
      "https://rpc.testnet.chain.robinhood.com";
    return new window.ethers.JsonRpcProvider(rpcUrl, 46630);
  }

  async function fetchOwnedTokenIds(ownerAddress, nftAddress, rpcUrl) {
    var logs = await rpcCall(rpcUrl, "eth_getLogs", [
      {
        address: nftAddress,
        topics: [TRANSFER_TOPIC],
        fromBlock: "0x0",
        toBlock: "latest",
      },
    ]);

    var owners = {};
    (logs || []).forEach(function (log) {
      if (!log.topics || log.topics.length < 4) return;
      var tokenId = topicToTokenId(log.topics[3]);
      owners[tokenId] = topicToAddress(log.topics[2]);
    });

    return Object.keys(owners)
      .filter(function (tokenId) {
        return (
          owners[tokenId] &&
          owners[tokenId].toLowerCase() === ownerAddress.toLowerCase()
        );
      })
      .sort(function (a, b) {
        return Number(a) - Number(b);
      });
  }

  async function getTbaAddress(tokenId) {
    var deployment = requireDeployment();
    var provider = await getReadProvider();
    var registry = new window.ethers.Contract(
      deployment.registry,
      REGISTRY_ABI,
      provider
    );
    return registry.account(
      deployment.accountImplementation,
      deployment.salt || "0x0000000000000000000000000000000000000000000000000000000000000000",
      deployment.chainId || 46630,
      deployment.nft,
      tokenId
    );
  }

  async function fetchTbaInventory(tbaAddress) {
    var deployment = requireDeployment();
    var provider = await getReadProvider();
    var items = new window.ethers.Contract(
      deployment.items,
      ITEMS_ABI,
      provider
    );
    var amounts = {};
    var ids = (itemCatalog && itemCatalog.items || []).map(function (item) {
      return item.id;
    });
    if (!ids.length) ids = [1, 2, 3, 4];

    await Promise.all(
      ids.map(async function (id) {
        var balance = await items.balanceOf(tbaAddress, id);
        amounts[id] = Number(balance);
      })
    );
    return amounts;
  }

  async function loadHeroForToken(tokenId, config) {
    var deployment = requireDeployment();
    config = config || {};
    selectedTokenId = tokenId;

    setPreviewContext(config.contextLabel || "Hero #" + tokenId, config.badgeType || false);

    var inventoryNote =
      config.inventoryNote ||
      "Live on-chain inventory for hero #" + tokenId + "'s token-bound account.";

    if (config.tokenIds && config.onTokenSelect) {
      renderTokenPicker(config.tokenIds, tokenId, config.onTokenSelect);
    } else if (els.tokenPicker) {
      els.tokenPicker.hidden = true;
      els.tokenPicker.innerHTML = "";
    }

    var provider = await getReadProvider();
    var nft = new window.ethers.Contract(
      deployment.nft,
      TESTER001_ABI,
      provider
    );

    var tokenUri = await nft.tokenURI(tokenId);
    var meta = await loadHeroMetadata(tokenId, tokenUri);
    renderHeroPreview(meta, tokenId, { metadataUrl: tokenUri });

    await appendTbaToInventoryNote(inventoryNote, tokenId);

    if (els.inventory) {
      els.inventory.innerHTML =
        '<p class="erc6551-holders-empty">Loading inventory from chain…</p>';
    }

    try {
      var tbaAddress = await getTbaAddress(tokenId);
      var amounts = await fetchTbaInventory(tbaAddress);
      if (itemCatalog) {
        renderInventory(itemCatalog, amounts);
      }
    } catch (invErr) {
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="erc6551-empty-state">' + invErr.message + "</p>";
      }
    }
  }

  async function resolveItemMintTarget(recipient) {
    var deployment = requireDeployment();
    var rpcUrl =
      deployment.rpc || "https://rpc.testnet.chain.robinhood.com";
    var tokenIds = await fetchOwnedTokenIds(
      recipient,
      deployment.nft,
      rpcUrl
    );

    if (!tokenIds.length) {
      return recipient;
    }

    var tokenId = tokenIds[0];
    if (
      selectedTokenId &&
      tokenIds.some(function (id) {
        return String(id) === String(selectedTokenId);
      })
    ) {
      tokenId = selectedTokenId;
    }

    return getTbaAddress(tokenId);
  }

  async function loadWalletHero(tokenId) {
    previewMode = "wallet";
    resetHolderSelect();
    await loadHeroForToken(tokenId, {
      badgeType: "wallet",
      contextLabel: "Your wallet · Hero #" + tokenId,
      inventoryNote:
        "Live on-chain inventory for hero #" + tokenId + "'s token-bound account.",
      tokenIds: ownedTokenIds,
      onTokenSelect: function (nextTokenId) {
        loadWalletHero(nextTokenId).catch(function (err) {
          showHeroEmptyState(err.message);
        });
      },
    });
    refreshPreviewFn = function () {
      return loadWalletHero(selectedTokenId);
    };
  }

  async function loadHolderPreview(address, tokenId) {
    var holder = findHolderByAddress(address);
    if (!holder) {
      throw new Error("Holder not found.");
    }

    previewMode = "holder";
    var tokenIds = holder.tokenIds;
    if (tokenId == null) tokenId = tokenIds[0];

    await loadHeroForToken(tokenId, {
      badgeType: "holder",
      contextLabel:
        "Holder · " + shortAddress(holder.address) + " · Hero #" + tokenId,
      inventoryNote:
        "Live on-chain inventory for " +
        shortAddress(holder.address) +
        "'s hero #" +
        tokenId +
        " token-bound account.",
      tokenIds: tokenIds.length > 1 ? tokenIds : null,
      onTokenSelect:
        tokenIds.length > 1
          ? function (nextTokenId) {
              loadHolderPreview(holder.address, nextTokenId).catch(function (err) {
                showHeroEmptyState(err.message);
              });
            }
          : null,
    });

    var holderAddress = holder.address;
    refreshPreviewFn = function () {
      return loadHolderPreview(holderAddress, selectedTokenId);
    };
  }

  async function onHolderSelectChange() {
    var address = els.holderSelect && els.holderSelect.value;
    if (!address) {
      if (connectedAddress) {
        await loadUserPortfolio(connectedAddress);
      } else {
        await restoreDeploymentPreview();
      }
      return;
    }

    try {
      await loadHolderPreview(address);
    } catch (err) {
      showHeroEmptyState(err.message);
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="erc6551-empty-state">' + err.message + "</p>";
      }
    }
  }

  async function loadUserPortfolio(address) {
    if (!address) {
      await restoreDeploymentPreview();
      return;
    }

    if (
      !currentDeployment ||
      currentDeployment.status !== "deployed" ||
      !currentDeployment.nft
    ) {
      showHeroEmptyState("Contracts are not deployed yet.");
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="erc6551-empty-state">Inventory unavailable until deployment completes.</p>';
      }
      return;
    }

    connectedAddress = address;
    previewMode = "wallet";
    resetHolderSelect();
    var rpcUrl =
      currentDeployment.rpc || "https://rpc.testnet.chain.robinhood.com";

    try {
      ownedTokenIds = await fetchOwnedTokenIds(
        address,
        currentDeployment.nft,
        rpcUrl
      );
    } catch (err) {
      showHeroEmptyState(err.message);
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="erc6551-empty-state">' + err.message + "</p>";
      }
      return;
    }

    if (!ownedTokenIds.length) {
      setPreviewContext("Your wallet", "wallet");
      showHeroEmptyState(
        "This wallet does not own a Tester001 hero NFT yet. Ask the contract owner to mint one to your address."
      );
      if (els.inventoryNote) {
        els.inventoryNote.textContent =
          "Connect a wallet that owns a Tester001 hero to view inventory.";
      }
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="erc6551-empty-state">No hero NFT found in this wallet.</p>';
      }
      return;
    }

    await loadWalletHero(ownedTokenIds[0]);
  }

  async function loadInventory(deployment) {
    try {
      itemCatalog = await loadJson("/assets/erc6551/items/catalog.json");
      if (connectedAddress) {
        await loadUserPortfolio(connectedAddress);
      } else if (
        previewMode === "holder" &&
        els.holderSelect &&
        els.holderSelect.value
      ) {
        await loadHolderPreview(els.holderSelect.value, selectedTokenId);
      } else {
        await loadDeploymentHeroPreview(
          deployment && deployment.tokenId ? deployment.tokenId : null
        );
      }
    } catch (err) {
      if (els.inventory) {
        els.inventory.textContent = err.message;
      }
    }
  }
  function renderTraits(attributes) {
    if (!els.traits) return;
    els.traits.innerHTML = "";
    (attributes || []).forEach(function (attr) {
      var chip = document.createElement("div");
      chip.className = "erc6551-trait";
      chip.innerHTML =
        "<strong>" + attr.trait_type + "</strong>" + (attr.value || "");
      els.traits.appendChild(chip);
    });
  }

  async function loadJson(path) {
    var res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  async function loadMetadata() {
    var base = origin();
    var metadataPath = "/assets/erc6551/1.json";
    var imagePath = "/assets/erc6551/hero/trainer.png";
    var metadataUrl = base + metadataPath;
    var imageUrl = base + imagePath;

    setText(els.origin, base);
    setText(els.metadataUrl, metadataUrl);
    setText(els.imageUrl, imageUrl);

    if (els.previewImage) {
      els.previewImage.src = imagePath;
      els.previewImage.alt = "Tester001 hero";
    }

    try {
      var meta = await loadJson(metadataPath);
      setText(els.previewName, meta.name);
      setText(els.previewDesc, meta.description);
      renderTraits(meta.attributes);
    } catch (err) {
      setText(els.previewName, "Metadata unavailable");
      setText(els.previewDesc, err.message);
    }
  }

  async function loadConfig() {
    if (!els.configRows) return;
    els.configRows.innerHTML = "";
    try {
      var config = await loadJson("/assets/erc6551/config.json");
      addRow(els.configRows, "Network", config.network);
      addRow(els.configRows, "Chain ID", String(config.chainId));
      addRow(els.configRows, "RPC", config.rpcUrl);
      addRow(
        els.configRows,
        "Registry",
        config.registry,
        config.explorer + "/address/" + config.registry
      );
      addRow(
        els.configRows,
        "Faucet",
        config.faucet,
        config.faucet
      );
    } catch (err) {
      addRow(els.configRows, "Error", err.message);
    }
  }

  async function loadDeployment() {
    if (!els.deploymentRows) return;
    els.deploymentRows.innerHTML = "";
    try {
      var deployment = await loadJson("/assets/erc6551/deployment.json");
      currentDeployment = deployment;
      var isLive = deployment.status === "deployed";

      if (els.status) {
        els.status.className =
          "erc6551-status " + (isLive ? "is-live" : "is-pending");
        els.status.textContent = isLive
          ? "Contracts deployed on Robinhood testnet."
          : deployment.message || "Waiting for contract deployment.";
      }

      if (deployment.nft) {
        addRow(
          els.deploymentRows,
          "Tester001",
          deployment.nft,
          deployment.explorer + "/address/" + deployment.nft,
          "Hero NFT contract (ERC-721). Mints the trainer hero tokens."
        );
      }
      if (deployment.items) {
        addRow(
          els.deploymentRows,
          "Tester001Items",
          deployment.items,
          deployment.explorer + "/address/" + deployment.items,
          "Items contract (ERC-1155). Mints potions, pokeballs, pokegold, and rare candy."
        );
      }
      if (deployment.tokenBoundAccount) {
        addRow(
          els.deploymentRows,
          "Token-bound account",
          deployment.tokenBoundAccount,
          deployment.explorer + "/address/" + deployment.tokenBoundAccount,
          "ERC-6551 smart wallet owned by the hero NFT. Holds the starter inventory."
        );
      }
      if (deployment.accountImplementation) {
        addRow(
          els.deploymentRows,
          "Account implementation",
          deployment.accountImplementation,
          deployment.explorer + "/address/" + deployment.accountImplementation,
          "Logic contract cloned for each token-bound account."
        );
      }
      if (deployment.registry) {
        addRow(
          els.deploymentRows,
          "ERC-6551 registry",
          deployment.registry,
          deployment.explorer + "/address/" + deployment.registry,
          "Canonical factory that creates token-bound accounts for NFTs."
        );
      }
      if (deployment.tokenId != null && deployment.tokenId !== "") {
        var tokenLink =
          deployment.nft && deployment.explorer
            ? deployment.explorer +
              "/token/" +
              deployment.nft +
              "/instance/" +
              deployment.tokenId
            : null;
        addRow(
          els.deploymentRows,
          "Hero token ID",
          String(deployment.tokenId),
          tokenLink,
          "The on-chain ID of the first minted hero NFT."
        );
      }
      if (deployment.mintedTo) {
        addRow(
          els.deploymentRows,
          "Minted to",
          deployment.mintedTo,
          deployment.explorer + "/address/" + deployment.mintedTo,
          "Wallet that received the first hero NFT at deploy time."
        );
      }
      if (deployment.itemsBaseURI) {
        addRow(
          els.deploymentRows,
          "Items metadata base URI",
          deployment.itemsBaseURI,
          null,
          "Off-chain JSON metadata path for ERC-1155 items."
        );
      }
      if (deployment.tokenURI) {
        addRow(
          els.deploymentRows,
          "Hero metadata URI",
          deployment.tokenURI,
          null,
          "Off-chain JSON metadata for the hero NFT."
        );
      }
      if (!deployment.nft) {
        addRow(
          els.deploymentRows,
          "Suggested base URI",
          origin() + "/assets/erc6551/"
        );
      }

      await loadInventory(deployment);
      await loadHolders(deployment);
    } catch (err) {
      if (els.status) {
        els.status.className = "erc6551-status is-pending";
        els.status.textContent = err.message;
      }
      await loadHolders(null);
    }
  }

  var TRANSFER_TOPIC =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  function topicToAddress(topic) {
    return "0x" + String(topic).slice(-40);
  }

  function topicToTokenId(topic) {
    return BigInt(topic).toString();
  }

  function walletAvatarUrl(address) {
    return "https://effigy.im/a/" + address + ".svg";
  }

  async function rpcCall(rpcUrl, method, params) {
    var res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: method,
        params: params,
      }),
    });
    var data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || "RPC request failed");
    }
    return data.result;
  }

  async function fetchNftHolders(nftAddress, rpcUrl) {
    var logs = await rpcCall(rpcUrl, "eth_getLogs", [
      {
        address: nftAddress,
        topics: [TRANSFER_TOPIC],
        fromBlock: "0x0",
        toBlock: "latest",
      },
    ]);

    var owners = {};
    (logs || []).forEach(function (log) {
      if (!log.topics || log.topics.length < 4) return;
      var tokenId = topicToTokenId(log.topics[3]);
      var owner = topicToAddress(log.topics[2]);
      owners[tokenId] = owner;
    });

    var grouped = {};
    Object.keys(owners).forEach(function (tokenId) {
      var owner = owners[tokenId];
      if (!owner || owner.toLowerCase() === ZERO_ADDRESS) return;
      if (!grouped[owner]) grouped[owner] = [];
      grouped[owner].push(tokenId);
    });

    var holders = Object.keys(grouped)
      .map(function (address) {
        return {
          address: address,
          tokenIds: grouped[address].sort(function (a, b) {
            return Number(a) - Number(b);
          }),
        };
      })
      .sort(function (a, b) {
        return Number(a.tokenIds[0]) - Number(b.tokenIds[0]);
      });

    return {
      totalHolders: holders.length,
      holders: holders,
    };
  }

  function renderHolders(holderData, explorer) {
    if (!els.holdersList) return;

    holdersCache = holderData.holders || [];
    populateHolderSelect(holdersCache);

    if (!holderData.holders.length) {
      els.holdersList.innerHTML =
        '<p class="erc6551-holders-empty">No holders found yet.</p>';
      if (els.holderCount) setText(els.holderCount, "0");
      return;
    }

    if (els.holderCount) {
      setText(els.holderCount, String(holderData.totalHolders));
    }

    els.holdersList.innerHTML = "";
    holderData.holders.forEach(function (holder) {
      var row = document.createElement("article");
      row.className = "erc6551-holder-row";

      var avatarWrap = document.createElement("div");
      avatarWrap.className = "erc6551-holder-avatar";
      var avatar = document.createElement("img");
      avatar.src = walletAvatarUrl(holder.address);
      avatar.alt = "Wallet avatar for " + holder.address;
      avatar.loading = "lazy";
      avatarWrap.appendChild(avatar);

      var body = document.createElement("div");
      body.className = "erc6551-holder-body";

      var addressLine = document.createElement("div");
      addressLine.className = "erc6551-holder-address";
      if (explorer) {
        var link = document.createElement("a");
        link.href = explorer + "/address/" + holder.address;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = holder.address;
        addressLine.appendChild(link);
      } else {
        addressLine.textContent = holder.address;
      }

      var meta = document.createElement("div");
      meta.className = "erc6551-holder-meta";
      holder.tokenIds.forEach(function (tokenId) {
        var chip = document.createElement("span");
        chip.className = "erc6551-holder-chip";
        chip.innerHTML = "<strong>ID</strong>#" + tokenId;
        meta.appendChild(chip);
      });

      body.appendChild(addressLine);
      body.appendChild(meta);
      row.appendChild(avatarWrap);
      row.appendChild(body);
      row.addEventListener("click", function () {
        if (!els.holderSelect) return;
        els.holderSelect.value = holder.address;
        onHolderSelectChange().catch(function (err) {
          showHeroEmptyState(err.message);
        });
      });
      row.classList.add("is-clickable");
      els.holdersList.appendChild(row);
    });
  }

  async function loadHolders(deployment) {
    if (!els.holdersList) return;

    if (!deployment || deployment.status !== "deployed" || !deployment.nft) {
      if (els.holderCount) setText(els.holderCount, "—");
      els.holdersList.innerHTML =
        '<p class="erc6551-holders-empty">Holders appear after the NFT contract is deployed.</p>';
      return;
    }

    els.holdersList.innerHTML =
      '<p class="erc6551-holders-empty">Loading holders from chain…</p>';

    try {
      var rpcUrl =
        deployment.rpc || "https://rpc.testnet.chain.robinhood.com";
      var holderData = await fetchNftHolders(deployment.nft, rpcUrl);
      renderHolders(holderData, deployment.explorer);
    } catch (err) {
      if (els.holderCount) setText(els.holderCount, "—");
      els.holdersList.innerHTML =
        '<p class="erc6551-holders-empty">' + err.message + "</p>";
    }
  }

  function setMintStatus(message, type) {
    if (!els.mintStatus) return;
    els.mintStatus.textContent = message || "";
    els.mintStatus.className =
      "erc6551-mint-status" + (type ? " is-" + type : "");
  }

  function requireDeployment() {
    if (!currentDeployment || currentDeployment.status !== "deployed") {
      throw new Error("Contracts are not deployed yet.");
    }
    if (!currentDeployment.nft || !currentDeployment.items) {
      throw new Error("NFT or items contract address is missing.");
    }
    return currentDeployment;
  }

  function parseRecipientAddress() {
    if (!window.ethers) {
      throw new Error("Mint tools failed to load. Refresh the page.");
    }
    var value = (els.recipientInput && els.recipientInput.value || "").trim();
    if (!window.ethers.isAddress(value)) {
      throw new Error("Enter a valid recipient wallet address.");
    }
    return window.ethers.getAddress(value);
  }

  async function getMintSigner() {
    if (!window.ethereum) {
      throw new Error("Connect the owner wallet first.");
    }
    if (!window.ethers) {
      throw new Error("Mint tools failed to load. Refresh the page.");
    }

    var provider = new window.ethers.BrowserProvider(window.ethereum);
    var network = await provider.getNetwork();
    if (Number(network.chainId) !== 46630) {
      throw new Error("Switch to Robinhood testnet before minting.");
    }

    return provider.getSigner();
  }

  async function assertContractOwner(contract, signerAddress) {
    var owner = await contract.owner();
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("Connected wallet is not the contract owner.");
    }
  }

  async function runMintAction(label, action) {
    var buttons = [
      els.mintHeroBtn,
      els.mintStarterBtn,
      els.mintItemBtn,
    ].filter(Boolean);

    try {
      buttons.forEach(function (button) {
        button.disabled = true;
      });
      setMintStatus(label + "…");
      var result = await action();
      setMintStatus(result, "success");
      if (currentDeployment) {
        await refreshCurrentPreview();
        await loadHolders(currentDeployment);
      }
    } catch (err) {
      setMintStatus(err.message || "Mint failed.", "error");
    } finally {
      buttons.forEach(function (button) {
        button.disabled = false;
      });
    }
  }

  async function mintHeroNft() {
    await runMintAction("Minting hero NFT", async function () {
      var deployment = requireDeployment();
      var recipient = parseRecipientAddress();
      var signer = await getMintSigner();
      var signerAddress = await signer.getAddress();
      var contract = new window.ethers.Contract(
        deployment.nft,
        TESTER001_ABI,
        signer
      );

      await assertContractOwner(contract, signerAddress);
      var tx = await contract.mint(recipient);
      var receipt = await tx.wait();
      var explorer = deployment.explorer || RH_CHAIN.blockExplorerUrls[0];
      return (
        "Minted hero NFT to " +
        recipient +
        ". Tx: " +
        explorer +
        "/tx/" +
        receipt.hash
      );
    });
  }

  async function mintStarterPack() {
    await runMintAction("Minting starter item pack", async function () {
      var deployment = requireDeployment();
      var recipient = parseRecipientAddress();
      var mintTarget = await resolveItemMintTarget(recipient);
      var signer = await getMintSigner();
      var signerAddress = await signer.getAddress();
      var contract = new window.ethers.Contract(
        deployment.items,
        ITEMS_ABI,
        signer
      );

      await assertContractOwner(contract, signerAddress);
      var tx = await contract.mintStarterPack(mintTarget);
      var receipt = await tx.wait();
      var explorer = deployment.explorer || RH_CHAIN.blockExplorerUrls[0];
      var targetLabel =
        mintTarget.toLowerCase() === recipient.toLowerCase()
          ? recipient
          : mintTarget + " (hero TBA)";
      return (
        "Minted starter item pack to " +
        targetLabel +
        ". Tx: " +
        explorer +
        "/tx/" +
        receipt.hash
      );
    });
  }

  async function mintSingleItem() {
    await runMintAction("Minting item", async function () {
      var deployment = requireDeployment();
      var recipient = parseRecipientAddress();
      var itemId = Number(els.mintItemSelect && els.mintItemSelect.value);
      var amount = Number(els.mintAmountInput && els.mintAmountInput.value);

      if (!itemId || itemId < 1) {
        throw new Error("Choose a valid item.");
      }
      if (!amount || amount < 1 || !Number.isInteger(amount)) {
        throw new Error("Enter a whole number amount of at least 1.");
      }

      var signer = await getMintSigner();
      var signerAddress = await signer.getAddress();
      var contract = new window.ethers.Contract(
        deployment.items,
        ITEMS_ABI,
        signer
      );

      await assertContractOwner(contract, signerAddress);
      var mintTarget = await resolveItemMintTarget(recipient);
      var tx = await contract.mintItem(mintTarget, itemId, amount);
      var receipt = await tx.wait();
      var itemName =
        els.mintItemSelect &&
        els.mintItemSelect.options[els.mintItemSelect.selectedIndex].text;
      var explorer = deployment.explorer || RH_CHAIN.blockExplorerUrls[0];
      var targetLabel =
        mintTarget.toLowerCase() === recipient.toLowerCase()
          ? recipient
          : mintTarget + " (hero TBA)";
      return (
        "Minted " +
        amount +
        " " +
        itemName +
        " to " +
        targetLabel +
        ". Tx: " +
        explorer +
        "/tx/" +
        receipt.hash
      );
    });
  }

  function shortAddress(address) {
    if (!address || address.length < 10) return address || "";
    return address.slice(0, 6) + "…" + address.slice(-4);
  }

  function setConnectLabel(label) {
    if (els.connectBtn) els.connectBtn.textContent = label;
    if (els.headerConnectBtn) els.headerConnectBtn.textContent = label;
  }

  async function refreshWallet() {
    if (!window.ethereum) {
      setText(els.walletAddress, "No wallet detected");
      setText(els.walletBalance, "Install MetaMask or Robinhood Wallet");
      setConnectLabel("Connect wallet");
      await restoreDeploymentPreview();
      return;
    }

    try {
      var accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (!accounts.length) {
        setText(els.walletAddress, "Not connected");
        setText(els.walletBalance, "—");
        setConnectLabel("Connect wallet");
        await restoreDeploymentPreview();
        return;
      }

      setText(els.walletAddress, accounts[0]);
      setConnectLabel(shortAddress(accounts[0]));
      var balanceHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      });
      var wei = BigInt(balanceHex);
      var eth = Number(wei) / 1e18;
      setText(els.walletBalance, eth.toFixed(4) + " ETH");
      await loadUserPortfolio(accounts[0]);
    } catch (err) {
      setText(els.walletBalance, err.message);
      setConnectLabel("Connect wallet");
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask or Robinhood Wallet to connect.");
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    try {
      await switchNetwork();
    } catch (err) {
      // Still load portfolio via public RPC if the user skips network switch.
    }
    await refreshWallet();
  }

  async function switchNetwork() {
    if (!window.ethereum) {
      alert("Install MetaMask or Robinhood Wallet to switch networks.");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RH_CHAIN.chainId }],
      });
    } catch (err) {
      if (err && err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [RH_CHAIN],
        });
      } else {
        throw err;
      }
    }
    if (connectedAddress) {
      await loadUserPortfolio(connectedAddress);
    }
  }

  function bindConnectButton(button) {
    if (!button) return;
    button.addEventListener("click", function () {
      connectWallet().catch(function (err) {
        alert(err.message || "Wallet connect failed");
      });
    });
  }

  bindConnectButton(els.connectBtn);
  bindConnectButton(els.headerConnectBtn);

  if (els.switchBtn) {
    els.switchBtn.addEventListener("click", function () {
      switchNetwork().catch(function (err) {
        alert(err.message || "Network switch failed");
      });
    });
  }

  if (els.holderSelect) {
    els.holderSelect.addEventListener("change", function () {
      onHolderSelectChange().catch(function (err) {
        showHeroEmptyState(err.message);
      });
    });
  }

  if (els.inventoryRefresh) {
    els.inventoryRefresh.addEventListener("click", function () {
      refreshCurrentPreview();
    });
  }

  if (els.mintHeroBtn) {
    els.mintHeroBtn.addEventListener("click", function () {
      mintHeroNft();
    });
  }

  if (els.mintStarterBtn) {
    els.mintStarterBtn.addEventListener("click", function () {
      mintStarterPack();
    });
  }

  if (els.mintItemBtn) {
    els.mintItemBtn.addEventListener("click", function () {
      mintSingleItem();
    });
  }

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", refreshWallet);
    window.ethereum.on("chainChanged", refreshWallet);
  }

  loadMetadata();
  loadConfig();
  loadDeployment();
  refreshWallet();
})();

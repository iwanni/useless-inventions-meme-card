<script>
  import MemeCard from "./lib/components/MemeCard.svelte";
  import { activeCard } from "./lib/stores/activeCard.js";

  const CARD_BACKS = {
    pokemon:  "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg",
    digimon:  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz9NREM0itup0Ic338yut2xS9GpClaOxyYcTPoZHdS_U5UWeLTxKG1CCc&s=10",
    yugioh:   "https://ms.yugipedia.com//thumb/e/e5/Back-EN.png/800px-Back-EN.png",
    onepiece: "https://cf.geekdo-images.com/cpyej29PfijgBDtiOuSFsQ__imagepage/img/aDMUMr-kD-RtLyOR2sKmzXtaXtk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6974116.jpg",
  };

  const cards = [
    {
      img: "https://images.pokemontcg.io/swshp/SWSH032_hires.png",
      name: "Pikachu SWSH032",
      back: CARD_BACKS.pokemon,
      effect: { rarity: "rare holo cosmos", subtypes: "basic", supertype: "pokémon", trainerGallery: false },
    },
    {
      img: "https://images.ygoprodeck.com/images/cards/74677422.jpg",
      name: "Dark Magician",
      back: CARD_BACKS.yugioh,
      effect: { rarity: "rare rainbow", subtypes: "basic", supertype: "pokémon", trainerGallery: false },
    },
    {
      img: "https://images.ygoprodeck.com/images/cards/33396948.jpg",
      name: "Blue-Eyes White Dragon",
      back: CARD_BACKS.yugioh,
      effect: { rarity: "rare secret", subtypes: "basic", supertype: "pokémon", trainerGallery: false },
    },
    {
      img: "https://static.dotgg.gg/onepiece/card/ST26-005_p1.webp",
      name: "One Piece ST26-005",
      back: CARD_BACKS.onepiece,
      effect: { rarity: "rare holo vmax", subtypes: "vmax", supertype: "pokémon", trainerGallery: false },
    },
    {
      img: "https://tcgplayer-cdn.tcgplayer.com/product/512771_in_1000x1000.jpg",
      name: "TCGPlayer Card",
      back: CARD_BACKS.digimon,
      effect: { rarity: "radiant rare", subtypes: "basic", supertype: "pokémon", trainerGallery: false },
    },
    {
      img: "/img/halu-abnormal.jpg",
      name: "Halu Abnormal - Psikolog Yuk",
      back: CARD_BACKS.pokemon,
      effect: { rarity: "rare holo v", subtypes: "v", supertype: "pokémon", trainerGallery: false },
    },
  ];

  const getIndexFromUrl = () => {
    const match = window.location.pathname.match(/^\/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      return Math.max(0, Math.min(n - 1, cards.length - 1));
    }
    return 0;
  };

  let currentIndex = getIndexFromUrl();

  const goTo = (index) => {
    if (index === currentIndex) return;
    $activeCard = undefined;
    currentIndex = index;
    history.pushState({}, "", `/${index + 1}`);
  };
</script>

<main class="meme-page">
  <div class="particles">
    {#each Array(30) as _, i}
      <div class="particle" style="--i: {i}; --x: {Math.random() * 100}; --y: {Math.random() * 100}; --d: {Math.random() * 6 + 3}s; --delay: {Math.random() * 5}s;"></div>
    {/each}
  </div>

  <div class="card-container">
    {#key currentIndex}
      <MemeCard
        img={cards[currentIndex].img}
        name={cards[currentIndex].name}
        back={cards[currentIndex].back}
        rarity={cards[currentIndex].effect.rarity}
        subtypes={cards[currentIndex].effect.subtypes}
        supertype={cards[currentIndex].effect.supertype}
        trainerGallery={cards[currentIndex].effect.trainerGallery}
      />
    {/key}
  </div>

  <div class="pagination">
    <button
      class="page-btn nav-btn"
      disabled={currentIndex === 0}
      on:click={() => goTo(currentIndex - 1)}
    >
      ‹
    </button>

    {#each cards as _, i}
      <button
        class="page-btn"
        class:active={i === currentIndex}
        on:click={() => goTo(i)}
      >
        {i + 1}
      </button>
    {/each}

    <button
      class="page-btn nav-btn"
      disabled={currentIndex === cards.length - 1}
      on:click={() => goTo(currentIndex + 1)}
    >
      ›
    </button>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #0a0a1a;
    font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .meme-page {
    width: 100vw;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(ellipse at 20% 50%, hsla(270, 60%, 25%, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, hsla(200, 80%, 20%, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, hsla(40, 80%, 25%, 0.3) 0%, transparent 50%),
      linear-gradient(180deg, #0a0a1a 0%, #121228 50%, #0d0d22 100%);
  }

  /* ============================
     CARD CONTAINER
     ============================ */

  .card-container {
    position: relative;
    z-index: 10;
    width: min(320px, 70vw);
    filter: drop-shadow(0 0 40px hsla(40, 100%, 50%, 0.15));
    animation: cardEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  @keyframes cardEntrance {
    0% {
      opacity: 0;
      transform: translateY(60px) scale(0.85);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ============================
     PAGINATION
     ============================ */

  .pagination {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: pageEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
    opacity: 0;
  }

  @keyframes pageEntrance {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(12px);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .page-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid hsla(40, 60%, 60%, 0.3);
    background: hsla(40, 20%, 10%, 0.5);
    color: hsla(40, 60%, 70%, 0.7);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    backdrop-filter: blur(4px);
  }

  .page-btn:hover:not(:disabled) {
    background: hsla(40, 60%, 50%, 0.2);
    border-color: hsla(40, 80%, 65%, 0.6);
    color: hsla(40, 80%, 80%, 1);
    transform: scale(1.1);
  }

  .page-btn.active {
    background: hsla(40, 70%, 45%, 0.35);
    border-color: hsla(40, 90%, 65%, 0.8);
    color: hsla(40, 100%, 85%, 1);
  }

  .page-btn.nav-btn {
    font-size: 1.2rem;
    line-height: 1;
  }

  .page-btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  /* ============================
     RESPONSIVE
     ============================ */

  @media screen and (max-height: 700px) {
    .card-container {
      width: min(240px, 55vw);
    }
    .pagination {
      bottom: 1rem;
    }
  }

  @media screen and (max-width: 400px) {
    .card-container {
      width: 75vw;
    }
  }
</style>

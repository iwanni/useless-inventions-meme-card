<script>
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import { activeCard } from "../stores/activeCard.js";
  import { orientation, resetBaseOrientation } from "../stores/orientation.js";
  import { clamp, round, adjust } from "../helpers/Math.js";

  export let img = "";
  export let name = "Meme Card";
  export let back = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg";
  export let rarity = "rare holo v";
  export let subtypes = "v";
  export let supertype = "pokémon";
  export let trainerGallery = false;

  const randomSeed = {
    x: Math.random(),
    y: Math.random()
  };

  const cosmosPosition = {
    x: Math.floor(randomSeed.x * 734),
    y: Math.floor(randomSeed.y * 1280)
  };

  let thisCard;
  let repositionTimer;
  let rafId = null;
  let pendingSpringUpdate = null;

  let active = false;
  let interacting = false;
  let firstPop = false;
  let loading = true;
  let isVisible = document.visibilityState === "visible";

  // Showcase animation state
  let showcaseRunning = true;
  let showcaseInterval;
  let showcaseTimerStart;
  let showcaseTimerEnd;

  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  const springPopoverSettings = { stiffness: 0.033, damping: 0.45 };
  let springRotate = spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = spring({ x: 50, y: 50 }, springInteractSettings);
  let springRotateDelta = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springTranslate = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springScale = spring(1, springPopoverSettings);

  const endShowcase = () => {
    if (showcaseRunning) {
      clearTimeout(showcaseTimerEnd);
      clearTimeout(showcaseTimerStart);
      clearInterval(showcaseInterval);
      showcaseRunning = false;
    }
  };

  const interact = (e) => {
    endShowcase();

    if (!isVisible) {
      return (interacting = false);
    }

    if ($activeCard && $activeCard !== thisCard) {
      return (interacting = false);
    }

    interacting = true;

    if (e.type === "touchmove") {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }

    const $el = e.target;
    const rect = $el.getBoundingClientRect();
    const absolute = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };

    pendingSpringUpdate = {
      background: {
        x: adjust(percent.x, 0, 100, 37, 63),
        y: adjust(percent.y, 0, 100, 33, 67),
      },
      rotate: {
        x: round(-(center.x / 3.5)),
        y: round(center.y / 3.5),
      },
      glare: {
        x: round(percent.x),
        y: round(percent.y),
        o: 1,
      },
    };

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (pendingSpringUpdate) {
          updateSprings(
            pendingSpringUpdate.background,
            pendingSpringUpdate.rotate,
            pendingSpringUpdate.glare
          );
          pendingSpringUpdate = null;
        }
        rafId = null;
      });
    }
  };

  const interactEnd = (e, delay = 500) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pendingSpringUpdate = null;

    setTimeout(function () {
      const snapStiff = 0.01;
      const snapDamp = 0.06;
      interacting = false;

      springRotate.stiffness = snapStiff;
      springRotate.damping = snapDamp;
      springRotate.set({ x: 0, y: 0 }, { soft: 1 });

      springGlare.stiffness = snapStiff;
      springGlare.damping = snapDamp;
      springGlare.set({ x: 50, y: 50, o: 0 }, { soft: 1 });

      springBackground.stiffness = snapStiff;
      springBackground.damping = snapDamp;
      springBackground.set({ x: 50, y: 50 }, { soft: 1 });
    }, delay);
  };

  const activate = (e) => {
    if ($activeCard && $activeCard === thisCard) {
      $activeCard = undefined;
    } else {
      $activeCard = thisCard;
      resetBaseOrientation();
    }
  };

  const deactivate = (e) => {
    interactEnd();
    $activeCard = undefined;
  };

  const reposition = (e) => {
    clearTimeout(repositionTimer);
    repositionTimer = setTimeout(() => {
      if ($activeCard && $activeCard === thisCard) {
        setCenter();
      }
    }, 300);
  };

  const setCenter = () => {
    const rect = thisCard.getBoundingClientRect();
    const view = document.documentElement;
    const delta = {
      x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
      y: round(view.clientHeight / 2 - rect.y - rect.height / 2),
    };
    springTranslate.set({ x: delta.x, y: delta.y });
  };

  const popover = () => {
    const rect = thisCard.getBoundingClientRect();
    let delay = 100;
    let scaleW = (window.innerWidth / rect.width) * 0.9;
    let scaleH = (window.innerHeight / rect.height) * 0.9;
    let scaleF = 1.75;
    setCenter();
    if (firstPop) {
      delay = 1000;
      springRotateDelta.set({ x: 360, y: 0 });
    }
    firstPop = false;
    springScale.set(Math.min(scaleW, scaleH, scaleF));
    interactEnd(null, delay);
  };

  const retreat = () => {
    springScale.set(1, { soft: true });
    springTranslate.set({ x: 0, y: 0 }, { soft: true });
    springRotateDelta.set({ x: 0, y: 0 }, { soft: true });
    interactEnd(null, 100);
  };

  const reset = () => {
    interactEnd(null, 0);
    springScale.set(1, { hard: true });
    springTranslate.set({ x: 0, y: 0 }, { hard: true });
    springRotateDelta.set({ x: 0, y: 0 }, { hard: true });
    springRotate.set({ x: 0, y: 0 }, { hard: true });
  };

  $: {
    if ($activeCard && $activeCard === thisCard) {
      popover();
      active = true;
    } else {
      retreat();
      active = false;
    }
  }

  const staticStyles = `
    --seedx: ${randomSeed.x};
    --seedy: ${randomSeed.y};
    --cosmosbg: ${cosmosPosition.x}px ${cosmosPosition.y}px;
  `;

  $: dynamicStyles = `
    --pointer-x: ${$springGlare.x}%;
    --pointer-y: ${$springGlare.y}%;
    --pointer-from-center: ${clamp(
      Math.sqrt(
        ($springGlare.y - 50) * ($springGlare.y - 50) +
          ($springGlare.x - 50) * ($springGlare.x - 50)
      ) / 50,
      0,
      1
    )};
    --pointer-from-top: ${$springGlare.y / 100};
    --pointer-from-left: ${$springGlare.x / 100};
    --card-opacity: ${$springGlare.o};
    --rotate-x: ${$springRotate.x + $springRotateDelta.x}deg;
    --rotate-y: ${$springRotate.y + $springRotateDelta.y}deg;
    --background-x: ${$springBackground.x}%;
    --background-y: ${$springBackground.y}%;
    --card-scale: ${$springScale};
    --translate-x: ${$springTranslate.x}px;
    --translate-y: ${$springTranslate.y}px;
  `;

  const updateSprings = (background, rotate, glare) => {
    springBackground.stiffness = springInteractSettings.stiffness;
    springBackground.damping = springInteractSettings.damping;
    springRotate.stiffness = springInteractSettings.stiffness;
    springRotate.damping = springInteractSettings.damping;
    springGlare.stiffness = springInteractSettings.stiffness;
    springGlare.damping = springInteractSettings.damping;

    springBackground.set(background);
    springRotate.set(rotate);
    springGlare.set(glare);
  };

  const orientate = (e) => {
    const x = e.relative.gamma;
    const y = e.relative.beta;
    const limit = { x: 16, y: 18 };
    const degrees = {
      x: clamp(x, -limit.x, limit.x),
      y: clamp(y, -limit.y, limit.y),
    };
    updateSprings(
      {
        x: adjust(degrees.x, -limit.x, limit.x, 37, 63),
        y: adjust(degrees.y, -limit.y, limit.y, 33, 67),
      },
      {
        x: round(degrees.x * -1),
        y: round(degrees.y),
      },
      {
        x: adjust(degrees.x, -limit.x, limit.x, 0, 100),
        y: adjust(degrees.y, -limit.y, limit.y, 0, 100),
        o: 1,
      }
    );
  };

  $: {
    if ($activeCard && $activeCard === thisCard) {
      interacting = true;
      orientate($orientation);
    }
  }

  document.addEventListener("visibilitychange", (e) => {
    isVisible = document.visibilityState === "visible";
    endShowcase();
    reset();
  });

  const imageLoader = (e) => {
    loading = false;
  };

  onMount(() => {
    if (isVisible) {
      showcaseRunning = false;
      showcaseTimerStart = setTimeout(() => {
        $activeCard = thisCard;
      }, 1000);
    }
  });
</script>

<svelte:window on:scroll={reposition} />

<div
  class="card interactive"
  class:active
  class:interacting
  class:loading
  data-rarity={rarity}
  data-subtypes={subtypes}
  data-supertype={supertype}
  data-trainer-gallery={trainerGallery}
  style={dynamicStyles}
  bind:this={thisCard}
>
  <div class="card__translater">
    <button
      class="card__rotator"
      on:click={activate}
      on:pointermove={interact}
      on:mouseout={interactEnd}
      on:blur={deactivate}
      aria-label="Expand the Meme Card; {name}."
      tabindex="0"
    >
      <img
        class="card__back"
        src={back}
        alt="The back of the card"
        loading="lazy"
        width="660"
        height="921"
      />
      <div class="card__front" style={staticStyles}>
        <img
          src={img}
          alt={name}
          on:load={imageLoader}
          loading="lazy"
          width="660"
          height="921"
        />
        <div class="card__shine"></div>
        <div class="card__glare"></div>
      </div>
    </button>
  </div>
</div>

<style>
  :root {
    --pointer-x: 50%;
    --pointer-y: 50%;
    --card-scale: 1;
    --card-opacity: 0;
    --translate-x: 0px;
    --translate-y: 0px;
    --rotate-x: 0deg;
    --rotate-y: 0deg;
    --background-x: var(--pointer-x);
    --background-y: var(--pointer-y);
    --pointer-from-center: 0;
    --pointer-from-top: var(--pointer-from-center);
    --pointer-from-left: var(--pointer-from-center);
  }
</style>

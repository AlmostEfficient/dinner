'use client';

import { useEffect } from 'react';

// List of food emojis
const FOOD_EMOJIS = ["🍕", "🍔", "🍟", "🌭", "🍿", "🧂", "🥓", "🥚", "🍳", "🧇", "🥞", "🧈", "🍞", "🥐", "🥨", "🥯", "🥖", "🧀", "🥗", "🥙", "🥪", "🌮", "🌯", "🫔", "🥫", "🍖", "🍗", "🥩", "🍠", "🥟", "🍤", "🍚", "🍜", "🍲", "🍥", "🍙", "🍘", "🍢", "🍣", "🍱", "🥡", "🦪", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "☕", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋", "🧃", "🧉", "🧊", "🥢", "🍽️", "🍴", "🥄", "🏺"];

// Helper function to create SVG data URI
const createSvgDataUri = (emoji: string): string => {
  const svg = `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
  return `data:image/svg+xml,${svg}`;
};

export default function DynamicFavicon() {
  useEffect(() => {
    // Find the favicon link element
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;

    // If it doesn't exist for some reason, create it
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // Set interval to change emoji
    let currentLink = link; // Keep track of the current link element
    const intervalId = setInterval(() => {
      const randomEmoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
      const newHref = createSvgDataUri(randomEmoji);

      // Remove the old link
      if (currentLink && currentLink.parentNode) {
          currentLink.parentNode.removeChild(currentLink);
      }

      // Create and add the new link
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = newHref;
      document.head.appendChild(newLink);

      // Update the reference to the current link
      currentLink = newLink;

    }, 2000); // Change every 2 seconds

    // Cleanup interval on component unmount
    return () => {
        clearInterval(intervalId);
        // Clean up the last added link element when the component unmounts
        if (currentLink && currentLink.parentNode) {
            currentLink.parentNode.removeChild(currentLink);
        }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // This component doesn't render anything visible
  return null;
} 
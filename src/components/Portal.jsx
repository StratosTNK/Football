import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Portal component that mounts children directly onto document.body.
 * Solves iOS WebKit / Safari stacking context and containing block bugs where
 * parent elements with `backdrop-filter` or `transform` trap `position: fixed` modals.
 */
export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
}

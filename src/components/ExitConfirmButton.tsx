import { useState } from "react";
import Modal from "./Modal";
import { playClick } from "../utils/sound";

export default function ExitConfirmButton({ onExit }: { onExit: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        className="exit-button"
        onClick={() => {
          playClick();
          setConfirming(true);
        }}
        aria-label="Oyundan çık"
        title="Ana menüye dön"
      >
        🚪
      </button>

      {confirming && (
        <Modal title="Oyundan çıkılsın mı?" onClose={() => setConfirming(false)}>
          <p className="exit-confirm-text">
            Ana menüye dönersen bu oyundaki ilerlemen kaybolur. Emin misin?
          </p>
          <div className="exit-confirm-actions">
            <button className="btn btn-secondary" onClick={() => setConfirming(false)}>
              Devam Et
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                playClick();
                onExit();
              }}
            >
              Çık
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

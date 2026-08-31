import Modal from "./Modal";
import { playClick } from "../utils/sound";

export default function ExitConfirmButton({
  confirming,
  onRequestConfirm,
  onCancel,
  onExit,
}: {
  confirming: boolean;
  onRequestConfirm: () => void;
  onCancel: () => void;
  onExit: () => void;
}) {
  return (
    <>
      <button
        className="exit-button"
        onClick={() => {
          playClick();
          onRequestConfirm();
        }}
        aria-label="Oyundan çık"
        title="Ana menüye dön"
      >
        🚪
      </button>

      {confirming && (
        <Modal title="Oyundan çıkılsın mı?" onClose={onCancel}>
          <p className="exit-confirm-text">
            Ana menüye dönersen bu oyundaki ilerlemen kaybolur. Emin misin?
          </p>
          <div className="exit-confirm-actions">
            <button className="btn btn-secondary" onClick={onCancel}>
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

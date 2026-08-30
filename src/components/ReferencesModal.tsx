import Modal from "./Modal";
import { questionPool } from "../data/questions";
import { termCards } from "../data/terms";

export default function ReferencesModal({ onClose }: { onClose: () => void }) {
  const termRefs = termCards.filter((t): t is typeof t & { source: string } => Boolean(t.source));
  const questionRefs = questionPool.filter((q): q is typeof q & { source: string } => Boolean(q.source));

  return (
    <Modal title="📚 Kaynakça" onClose={onClose}>
      <p className="intro-text" style={{ marginBottom: 18 }}>
        Bu uygulamadaki teorik bilgiler, güncel İK kavramları ve tarihsel/istatistiksel iddialar aşağıdaki
        akademik ve otoriter kaynaklara dayanmaktadır. Davranışsal/durumsal senaryo soruları (STAR yöntemi,
        çatışma yönetimi vb.) genel kabul görmüş mülakat koçluğu pratiklerini yansıtır ve tek bir "doğru"
        kaynağa bağlı değildir.
      </p>

      {termRefs.length > 0 && (
        <>
          <p className="reference-section-title">Terim Küresi</p>
          <div className="term-glossary">
            {termRefs.map((t) => (
              <div className="term-glossary-item" key={t.id}>
                <p className="term-glossary-term">{t.term}</p>
                <p className="term-glossary-def">{t.source}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {questionRefs.length > 0 && (
        <>
          <p className="reference-section-title">Mülakat Soruları</p>
          <div className="term-glossary">
            {questionRefs.map((q) => (
              <div className="term-glossary-item" key={q.id}>
                <p className="term-glossary-term">{q.interviewerLine}</p>
                <p className="term-glossary-def">{q.source}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

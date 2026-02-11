export default function CutsGallery() {
  return (
    <section className="cuts">
      <div className="cuts-content">
        <div className="cuts-grid">
          <div className="cut-card">
            <video
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838550/corte1_nztjrt.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span>Cuidado de barba</span>
          </div>

          <div className="cut-card">
            <video
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838550/corte2_zrwczp.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span>Fade y barba</span>
          </div>

          <div className="cut-card">
            <video
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838550/corte4_a9vtbk.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span>Corte y mechas</span>
          </div>

          <div className="cut-card">
            <video
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838551/corte3_ra82rn.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span>Corte y tintura global</span>
          </div>
        </div>
      </div>
    </section>
  );
}

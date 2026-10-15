// Static design studies only. Copy and scenes are illustrative, not product-status claims.
export const concepts = {
  obsidian: {
    layout: "01 / Cinematic cover",
    title: "Obsidian / The instrument",
    detail: "Full-bleed macro photography, an oversized left-aligned headline and a floating glass invitation. A launch film translated into a landing page.",
    markup: `<div class="concept cinema">
      <img class="cinema-photo" src="/assets/hero-smoked-instrument.png" alt="Concept render of a smoked-glass precision instrument in a dark studio" width="1536" height="1024">
      <div class="concept-nav"><span class="concept-wordmark">aegntic<span class="wordmark-dot">.</span></span><span>THE INSTRUMENT &nbsp; / &nbsp; FIELD NOTES</span><span class="nav-invite">EARLY ACCESS ↗</span></div>
      <div class="cinema-copy"><span class="concept-kicker">INTENT. GIVEN FORM.</span><h3>Your next<br>move.<br><em>Amplified.</em></h3><p>A workspace for the ideas<br>you’re ready to make real.</p></div>
      <div class="cinema-bottom"><span class="scene-index">01 — THE BEGINNING<br><small>AEGNTIC / CONCEPT STUDY</small></span><div class="glass-invite"><span>A place in what comes next.</span><strong>Join the waitlist <b>↗</b></strong></div></div>
    </div>`
  },
  chrome: {
    layout: "02 / Architectural showcase",
    title: "Chrome / Built together",
    detail: "A bold typographic masthead, panoramic gallery scene and numbered process strip. Bright, spacious and built around a single sculptural hero.",
    markup: `<div class="concept architecture">
      <div class="concept-nav"><span class="concept-wordmark">aegntic.</span><span>A WORKSPACE FOR WHAT’S NEXT</span><span>EXPLORE THE SYSTEM ↗</span></div>
      <div class="architecture-heading"><h3>Many minds.<br><em>One direction.</em></h3><div><span class="concept-kicker">COORDINATED INTELLIGENCE</span><p>From a first thought<br>to something that matters.</p><span class="concept-cta">Find your place ↗</span></div></div>
      <div class="gallery-image"><img src="/assets/hero-glass-gallery.png" alt="Concept render of connected glass slabs in a sunlit architectural gallery" width="1536" height="1024"><span class="image-note">FIG. 01 &nbsp; / &nbsp; INDIVIDUAL PARTS. SHARED PURPOSE.</span></div>
      <div class="process-strip"><div><span>01</span><strong>Frame the intent</strong></div><div><span>02</span><strong>Shape the work</strong></div><div><span>03</span><strong>See what changed</strong></div></div>
    </div>`
  },
  pearl: {
    layout: "03 / Editorial journal",
    title: "Pearl / The unfinished journal",
    detail: "A magazine cover with a narrow contents rail, portrait image crop and contrasting serif typography. Story-led, intimate and deliberately off-centre.",
    markup: `<div class="concept editorial">
      <div class="journal-masthead"><span>AEGNTIC JOURNAL</span><span>ISSUE 001<br>THE ART OF BEGINNING</span></div>
      <div class="journal-grid"><div class="journal-rail"><span>IN THIS ISSUE</span><span>01 / Intent<br>02 / Practice<br>03 / Progress</span><span class="rail-bottom">AN OPEN<br>WORK IN<br>PROGRESS.</span></div>
      <figure class="journal-photo"><img src="/assets/hero-glass-gallery.png" alt="Close crop of refracting glass and architectural daylight" width="1536" height="1024"><figcaption>Objects of intention. A material study.</figcaption></figure>
      <div class="journal-copy"><span class="concept-kicker">A NOTE TO THE BUILDERS</span><h3>Leave room<br>for the<br><em>unexpected.</em></h3><p>The best ideas rarely arrive finished. Give yours a place to take shape, one considered step at a time.</p><span class="journal-link">Follow the making <b>↗</b></span><div class="journal-signoff">aegntic.<small>Tools for a practice,<br>not just a launch.</small></div></div></div>
      <div class="journal-footer"><span>THOUGHTFULLY MADE. OPENLY SHARED.</span><span>TURN THE PAGE →</span></div>
    </div>`
  },
  signal: {
    layout: "04 / Live-build console",
    title: "Instrument / Work in the open",
    detail: "A compact navigation rail, a modular workbench and a build-log panel. Dense, functional and monospaced, with the hero object acting as an instrument rather than a backdrop.",
    markup: `<div class="concept workbench">
      <div class="bench-rail"><span class="bench-monogram">ae.</span><span>01<br>OVERVIEW</span><span>02<br>WORKSPACE</span><span>03<br>BUILD LOG</span><span class="rail-bottom">V.02<br>CONCEPT</span></div>
      <div class="bench-main"><div class="bench-header"><span>AEGNTIC / OPEN WORKBENCH</span><span class="bench-status">◌ DESIGN STUDY</span></div>
      <div class="bench-grid"><div class="bench-intro"><span class="concept-kicker">LESS MYSTERY. MORE MAKING.</span><h3>Make<br>progress<br><span>visible.</span></h3><p>A place for the brief,<br>the work and the evidence.</p><span class="bench-cta">WATCH THE BUILD ↗</span></div>
      <figure class="bench-object"><img src="/assets/hero-smoked-instrument.png" alt="Smoked-glass control lens on a machined graphite instrument" width="1536" height="1024"><figcaption>CONTROL SURFACE / MATERIAL STUDY</figcaption></figure>
      <div class="bench-log"><div><span>BUILD LOG</span><span>SAMPLE ENTRIES</span></div><p><span>001</span><strong>Frame the outcome</strong><small>BRIEF</small></p><p><span>002</span><strong>Explore four directions</strong><small>DESIGN</small></p><p><span>003</span><strong>Review the launch kit</strong><small>NEXT</small></p></div>
      <div class="bench-note"><span>THE OPERATING PRINCIPLE</span><strong>Show the work.<br>Keep the evidence.</strong><small>Illustrative layout.<br>No live workers are shown.</small></div></div>
      <div class="bench-footer"><span>INTENT → WORK → EVIDENCE</span><span>BUILT IN THE OPEN ↗</span></div></div>
    </div>`
  }
};
export function renderConcept(id, target) {
  const concept = concepts[id] || concepts.obsidian;
  // Trusted, fixed local templates: no user input is interpolated into HTML.
  target.innerHTML = concept.markup;
  target.setAttribute("aria-label", concept.title);
  const caption = document.createElement("div"); caption.className = "concept-description";
  const heading = document.createElement("h3"); heading.textContent = concept.title;
  const description = document.createElement("p"); description.textContent = concept.detail;
  const note = document.createElement("small"); note.textContent = "LAYOUT PREVIEW · GENERATED CONCEPT IMAGERY · SAMPLE COPY · LINKS ARE ILLUSTRATIVE";
  caption.append(heading, description, note); target.append(caption);
}

import "../styles/About.css";

const About = () => {
  return (
    <div className="about">
      <h1>À propos de FrigoCheck</h1>

      <section className="about-content">
        <h2>Notre Mission</h2>
        <p>
          FrigoCheck est votre assistant personnel pour la gestion de vos
          courses et de votre stock alimentaire. Notre objectif est de vous
          aider à réduire le gaspillage alimentaire tout en optimisant vos
          achats.
        </p>

        <h2>Fonctionnalités</h2>
        <ul>
          <li>Suivi en temps réel de votre stock</li>
          <li>Génération intelligente de listes de courses</li>
          <li>Alertes de péremption</li>
          <li>Suggestions de recettes basées sur vos ingrédients</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Pour toute question ou suggestion, n'hésitez pas à nous contacter :
          <br />
          Email : sambah450@gmail.com
        </p>
      </section>
    </div>
  );
};

export default About;

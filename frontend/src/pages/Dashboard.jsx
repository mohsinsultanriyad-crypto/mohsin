import { useEffect, useState } from "react";
import { getNews } from "../services/api";

export default function Dashboard() {
  const [news, setNews] = useState([]);

  async function loadNews() {
    const data = await getNews();
    setNews(data.items || []);
  }

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="page">
      <h2>Latest Saudi News</h2>

      {news.map((n) => (
        <div key={n._id} className="news-card">
          <h4>{n.title}</h4>
          <p>{n.summary}</p>
          <a href={n.link} target="_blank">Read more</a>
        </div>
      ))}
    </div>
  );
}

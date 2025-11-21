import { useState, useEffect } from "react";
import api from "../config/axios";

export default function Friends() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    api
      .get("/friends", { withCredentials: true })
      .then((res) => setFriends(res.data.friends));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Друзья</h2>
      {friends.length === 0 && <p>Список друзей пуст</p>}
      <ul className="list-group">
        {friends.map((f) => (
          <li key={f.id} className="list-group-item d-flex align-items-center">
            <img src={f.avatar} alt="avatar" width={50} className="me-3" />
            <span>
              {f.firstName} {f.lastName}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

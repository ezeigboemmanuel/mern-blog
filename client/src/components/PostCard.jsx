import React from "react";
import { Link } from "react-router-dom";

const PostCard = ({
  _id,
  title,
  summary,
  content,
  coverImage,
  createdAt,
  author,
}) => {
  return (
    <>
      <div className="post">
        <Link to={`/post/${_id}`}>
          <img src={`https://mern-blog-backend-f3i6.onrender.com/${coverImage}`} alt="blog_img" />
        </Link>

        <div className="texts">
          <Link to={`/post/${_id}`}>
            <h2>{title}</h2>
          </Link>
          <p className="info">
            <a href="/" className="author">
              {author.username}
            </a>
            <time>
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </p>
          <p className="summary">{summary}</p>
        </div>
      </div>
    </>
  );
};

export default PostCard;

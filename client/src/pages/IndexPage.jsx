import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

const IndexPage = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/post`).then((response) => {
      response.json().then((posts) => {
        setPosts(posts);
      });
    });
  }, []);
  return (
    <>
      {posts.length > 0 &&
        posts.map((post) => <PostCard key={post._id} {...post} />)}
    </>
  );
};

export default IndexPage;

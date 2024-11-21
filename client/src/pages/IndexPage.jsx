import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

const IndexPage = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("https://mern-blog-phi-sage.vercel.app/post").then((response) => {
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

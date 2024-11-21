import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../components/Editor";

const EditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch(`https://mern-blog-backend-f3i6.onrender.com/post/${id}`).then((response) => {
      response.json().then((postData) => {
        setTitle(postData.title);
        setSummary(postData.summary);
        setContent(postData.content);
      });
    });
  }, [id]);

  const updatePost = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (files?.[0]) {
      data.set("file", files?.[0]);
    }

    const response = await fetch(`https://mern-blog-phi-sage.vercel.app/edit/${id}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    }
  };

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }
  return (
    <form onSubmit={(e) => updatePost(e)}>
      <input
        type="title"
        placeholder="Title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="summary"
        placeholder="Summary"
        name="summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <input type="file" onChange={(e) => setFiles(e.target.files)} />

      <Editor onChange={setContent} value={content} />

      <button style={{ marginTop: "5px" }}>Update post</button>
    </form>
  );
};

export default EditPost;

import React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";

function Upload() {
  const [progress, setProgress] = useState(0);
  const [name, setName] = useState("");

  const queryClient = useQueryClient();

  const { status, data, refetch } = useQuery({
    queryKey: ["retrieve_data_columns"],
    queryFn: () => {
      return axios.get("/retrieve_data_columns", { responseType: "json" });
    },
    enabled: false, // prevent query for automatically running
    staleTime: "Infinity", // prevent data from going stale
    cacheTime: "Infinity", // prevent cache from being garbage collected
    retry: false, // prevent retries
    retryOnMount: false, // prevent retrying when component is mounted
  });

  const config = {
    onUploadProgress: (progressEvent) =>
      setProgress(
        Math.round((progressEvent.loaded / progressEvent.total) * 100)
      ),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const uploadMutation = useMutation(
    (formData) => {
      return axios.post("/upload", formData, config);
    },
    {
      onSuccess: () => refetch(),
      onError: () => console.log("Error!"),
    }
  );

  function handleChange(event) {
    const file = event.target.files[0];
    const name = file.name;
    const extension = name.split(".").pop().toLowerCase();

    if (extension !== "csv" && extension !== "txt") {
      event.target.value = null;
      setName("");
      setProgress(0);
      return null;
    }

    setName(name);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    uploadMutation.mutate(formData);
  }

  return (
    <>
      <input type="file" accept=".csv,.txt" onChange={handleChange} />

      <p>{name !== "" && `File name:${name}`}</p>

      <p>{`${progress}%`}</p>

      <select disabled={status == "success" ? false : true}>
        {data && data.data.map((opt) => <option key={opt}>{opt}</option>)}
      </select>
    </>
  );
}

export default Upload;

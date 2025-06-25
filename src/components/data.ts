const sampleJson = {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {
          "textAlign": null,
          "level": 1
        },
        "content": [
          {
            "type": "text",
            "text": "hell"
          }
        ]
      },
      {
        "type": "paragraph",
        "attrs": {
          "textAlign": null
        },
        "content": [
          {
            "type": "text",
            "text": "London's Newest Luxury Hotel Was Once The US Embassy.... "
          }
        ]
      }
    ]
  } 
 export  const promptHelper= `this is an example of how we would insert a heading ${JSON.stringify(sampleJson)}`;
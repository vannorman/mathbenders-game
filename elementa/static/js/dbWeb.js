    function InitDb(){
        fetch('/initdb',{ 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
    //          body: JSON.stringify({ }),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log('init db:'+JSON.stringify(data));
                // Redirect or take other actions if needed
              })
              .catch((error) => console.error('Error:', error));
          }



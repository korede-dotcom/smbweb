import { myEnvVariable } from './config.js';



const eventpackage = async () => {
  const response = await fetch(`${myEnvVariable}client/event/pkg`);
  const data = await response.json();
  console.log(data);
  return data;
};

const eventsPromise = eventpackage();
eventsPromise.then(eventsData => {
  const events = eventsData.data.pkgs;
  populateSelect('event', events,"event");
});

const branchs = async () => {
  const response = await fetch(`${myEnvVariable}branch/active`);
  const data = await response.json();
  console.log(data);
  return data
};

const branchPromise = branchs();
branchPromise.then(branchData => {
  const branch = branchData.data.active;
  populateSelect('branch', branch,"branch");
});







// Function to populate select element with options
function populateSelect(selectId, data,type) {
  const select = document.getElementById(selectId);

  // Clear existing options
  select.innerHTML = '';

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.text = `Select a ${selectId}`;
  select.appendChild(defaultOption);

  // Add options based on data

  switch (type) {
    case "event":
        // const populateAllEvent = document.querySelector("#allevent")
        // populateAllEvent.innerHTML = `${data.map(d => {
        //     return `
        //     <div class="col-12">
        //     <a class="animal-item" href="/img/bg2.jpeg" data-lightbox="animal">
        //         <div class="position-relative">
        //             <img class="img-fluid" src="/img/bg2.jpeg" alt="">
        //             <div class="animal-text p-4">
        //                 <p class="text-white small text-uppercase mb-0">Birthday</p>
        //                 <h5 class="text-white mb-0">Birthday</h5>
        //             </div>
        //         </div>
        //     </a>
        // </div>
        //     `
        // }).join("")}`
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item._id;
          option.text = item.event_type;
            option.setAttribute("id",item.price)
          select.appendChild(option);
        });
        
        break;
    case "branch":
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item._id;
          option.text = item.name;
        
          select.appendChild(option);
        });
        
        break;
  
    default:
        break;
  }
}

let modalPrice = document.getElementById('modalPrice');
let eventname = document.getElementById('modalEventName');
function showModal(status) {
    let modalMessage = document.getElementById('modalMessage');
    let userDetailsForm = document.getElementById('userDetailsForm');
  
    if (status === 'picked') {
      modalMessage.textContent = "Sorry, we are already booked for this date. Please pick another date.";
      userDetailsForm.classList.add('hidden');
    } else {
      modalMessage.textContent = "Yay! We are available for your event. Please provide your details to proceed.";
      userDetailsForm.classList.remove('hidden');
    }
    document.getElementById('modalOverlay').style.display = 'block';
    document.body.classList.add('modal-open');
  }
  
  document.getElementById('bookingForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const submitButton = document.getElementById('submitBtn');
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="loader"></span>Loading...';
  
//   const eventName = document.getElementById('event').value;
  const selectElement = document.getElementById('event');
  const selectedOptionId = selectElement.options[selectElement.selectedIndex].id;
  const selectedOptionName = selectElement.options[selectElement.selectedIndex].text;
  const eventTag = selectElement.options[selectElement.selectedIndex];
  const getEventId = eventTag.getAttribute('value')
  
  console.log(selectedOptionId); // Output: id (price) of the selected option
  console.log(selectedOptionName); // Output: id (price) of the selected option
  console.log(getEventId); // Output: id (price) of the selected option

  
  
    const selectedBranch = document.getElementById('branch').value;
    const selectedDate = document.getElementById('date').value;
  
    const response = await fetch(`${myEnvVariable}client/validate/date/?date=${new Date(selectedDate).toISOString().split('T')[0]}&branch_id=${selectedBranch}`);
    const data = await response.json();
  
    if (!data.status) {
      showModal('picked');
      submitButton.disabled = false;
    submitButton.innerHTML = 'Book';

    } else {
      showModal('available');
      modalPrice.textContent = `EventPrice Price : ${selectedOptionId}`
      eventname.innerHTML = `Event Type : ${selectedOptionName}`
      const formElement = document.getElementById('userDetailsForm');

      formElement.addEventListener('submit',async (event) => {
        event.preventDefault();
        
        const formData = new FormData(formElement);
        const formValues = Object.fromEntries(formData);
        
        const details ={
            ...formValues,
            branch_id:parseInt(selectedBranch),
            event_type:parseInt(getEventId),
            date:selectedDate,
            amount:parseInt(selectedOptionId)
            
        }
          const response = await fetch(`${myEnvVariable}payments/initiate-payment`,{
              method:"POST",
              headers:{
                  "Content-Type":"application/json"
              },
              body:JSON.stringify(details)
          })
          const data = await response.json()
          console.log("🚀 ~ file: service.js:235 ~ saveToDb ~ data:", data)
          // closeModal();
        

        closeModal();
       
        function generateReference() {
            document.getElementById('modalOverlay').style.display = 'none';
            document.body.classList.remove('modal-open');
            // generates a random string of 10 characters
            var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = '';
            for ( var i = 0; i < 10; i++ ) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            return result;
          }
          var reference = 'SMBH-' + generateReference(); 
          function payWithPaystack() {
            var handler = PaystackPop.setup({
              key: 'pk_test_5ca2ce7d8141dfde32f19b2807d9794dc1285f76',
              email: 'customer@example.com',
              amount: Number(details.amount) * 100,
              currency: "NGN",
              ref: reference,
              metadata: {
                 custom_fields: [
                    {
                        display_name: "Full Name",
                        variable_name: "full_name",
                        value: "John Doe"
                    }
                 ]
              },
              callback: function(response) {
                  // handle successful payments here
                  console.log("🚀 ~ file: service.js:181 ~ payWithPaystack ~ response:", response)
                  if (response.status === "success") {
               
                     saveToDb()
                    formElement.reset();
                    alert('Payment complete! Reference: ' + response.reference);
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Book';
                  }

                  
              },
              onClose: function() {
                  // handle close event here
                  submitButton.disabled = false;
                  submitButton.innerHTML = 'Book';
                //   alert('Payment closed');
                //   alert('Payment closed');
              }
            });
            handler.openIframe();
          }
          // payWithPaystack()
      
        const saveToDb = async () => {
            const response = await fetch(`${myEnvVariable}payments/initiate-payment`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(details)
            })
            const data = await response.json()
            console.log("🚀 ~ file: service.js:235 ~ saveToDb ~ data:", data)
            if (data.authorization_url) {
              window.location.href = data.authorization_url
          
              
            }

            // closeModal();
          

        }
        saveToDb();
      });
      
      
    }

  
    // console.log('Selected Event:', value);
    console.log('Selected Event:', selectElement);
    console.log('Selected Branch:', selectedBranch);
    console.log('Selected Date:', selectedDate);
  
    this.reset();
  });
  
function closeModal() {
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.body.classList.remove('modal-open');
});
}
closeModal();
  

const addPricing = async () => {
    const priceListContainer = document.querySelector("#pricelist")
    eventsPromise.then(eventsData => {
        const events = eventsData.data.pkgs;
       
        priceListContainer.innerHTML = `${events.map((content,i) => {
            return `
                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                        <div class="Membership-item position-relative">
                            <img class="img-fluid" src="/img/bg2.jpeg" alt="">
                            <h1 class="display-1">${i + 1}</h1>
                            <h4 class="text-white mb-3">${content.event_type}</h4>
                            <h3 class="text-primary mb-4">&#8358;${content.price}</h3>
                            <br/>
                            <br/>
                            <p><i class="fa fa-check text-primary me-3"></i>${content.description}</p>
                        </div>
                </div>
            
            `
        }).join("")}
        
        `
      });


}

addPricing()



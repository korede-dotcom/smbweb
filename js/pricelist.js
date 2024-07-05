import { myEnvVariable } from './config.js';

const priceListContainer = document.querySelector("#pricelist")

const eventpackage = async () => {
  const response = await fetch(`${myEnvVariable}client/event/pkg`);
  const data = await response.json();
  console.log(data);
  return data;
};

const eventsPromise = eventpackage();



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
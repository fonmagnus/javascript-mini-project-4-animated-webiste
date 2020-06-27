let controller;
let slideScene;
let detailScene;
let pageScene;

function animateSlides() {
  // ? Initiate Controller
  controller = new ScrollMagic.Controller();

  const sliders = document.querySelectorAll(".slide");
  const nav = document.querySelector(".nav-header");

  // ? Loop over each slide
  sliders.forEach((slide, index, slides) => {
    const revealImg = slide.querySelector(".reveal-img");
    const img = slide.querySelector("img");
    const revealText = slide.querySelector(".reveal-text");

    // ? Creating animation timeline
    const slideTimeline = gsap.timeline({
      defaults: {
        duration: 1,
        ease: "power2.inOut",
      },
    });

    /*
      ? GSAP animation timeline : imagine like an array consist of multiple animations
      * fromTo : method that initialize animation starting state and ending state
      * First Param : elements you want to animate
      * Second Param : start state (CSS attributes of starting element)
      * Third Param : ending state (CSS attributes at the last state)
      * Fourth Param (optional) : -=x indicates that we faster the animation time by x second
    */

    // slideTimeline.fromTo(
    //   revealImg,
    //   { opacity: 1, scale: 1, y: "0%" },
    //   { opacity: 0, scale: 0, y: "100%" }
    // );
    slideTimeline.fromTo(img, { scale: 1.5 }, { scale: 1 }, "-=1");
    // slideTimeline.fromTo(
    //   revealText,
    //   { opacity: 1, scale: 1, y: "0%" },
    //   { opacity: 0, scale: 0, y: "100%" },
    //   "-=1"
    // );

    // Create Scene
    /*
      ? ScrollMagic.Scene : pass a JSON object to constructor
      * triggerElement : what elements that will trigger the animations
      * triggerHook : offset / threshold indicates when we have reached that percentage of element, then the animation will start
      
      ? Method : 
      * setTween : a timeline object (array of animation) that will be applied to the trigger element
      * addIndicators : create some "mark" on the window to see which particular point will trigger the animation
      * addTo : add this scene to main controller of ScrollMagic
    */
    slideScene = new ScrollMagic.Scene({
      triggerElement: slide,
      triggerHook: 0.5,
      reverse: false,
    })
      .setTween(slideTimeline)
      // .addIndicators({
      //   colorStart: "white",
      //   colorTrigger: "white",
      //   name: "slide",
      // })
      .addTo(controller);

    // Create new timeline
    /*
      ? What does opacity and scale does?
      * Since we're manipulating the 'slide' element, then it will impact the CSS attribute of opacity and scale of that slide
    */
    const pageTimeline = gsap.timeline();
    /*
      ? Why do we need to add nextSlide ?
      * For simple, we "move" the position of next slide below so that the 
      * animation will not immediately be triggered when we fastly scrolling down
      * Then we "move" back the position of the next slide up after the animation
      * of fading out image is finished
    */
    let nextSlide = index === slides.length - 1 ? "end" : slides[index + 1];
    pageTimeline.fromTo(nextSlide, { y: "0%" }, { y: "20%" });
    pageTimeline.fromTo(
      slide,
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: 0.5 }
    );
    pageTimeline.fromTo(nextSlide, { y: "20%" }, { y: "0%" }, "-=0.5");

    // Create new scene

    /*
      ? What is the duration on scene?
      * The duration indicates how fast / slow the animation will be
      * It seems the percentage is based on the element size
    */
    pageScene = new ScrollMagic.Scene({
      triggerElement: slide,
      triggerHook: 0,
      duration: "100%",
    })
      // .addIndicators({
      //   colorStart: "white",
      //   colorTrigger: "white",
      //   name: "page",
      //   indent: 200,
      // })
      /*
        ? What is the method setPin stands for here?
        * the method .setPin is to "pin" the element on current window
        * removing this method makes the element's position relative to the window movement
         
        ? What is pushFollowers in setPin method?
        * The pushFollowers is a empty div that will follow the setPin method after
        * we scrolldown the element. Having it's set into 'false' means that we disable those
        * content of empty div
      */
      .setPin(slide, { pushFollowers: false })
      .setTween(pageTimeline)
      .addTo(controller);
  });
}

const mouse = document.querySelector(".cursor");
const mouseText = mouse.querySelector("span");
const burger = document.querySelector(".burger");
function cursor(e) {
  mouse.style.top = e.pageY + "px";
  mouse.style.left = e.pageX + "px";
}

function activeCursor(e) {
  const item = e.target;
  if (item.id === "logo" || item.classList.contains("burger")) {
    mouse.classList.add("nav-active");
  } else {
    mouse.classList.remove("nav-active");
  }

  if (item.classList.contains("explore")) {
    mouse.classList.add("explore-active");
    gsap.to(".title-swipe", 1, { y: "0%" });
  } else {
    mouse.classList.remove("explore-active");
    gsap.to(".title-swipe", 1, { y: "100%" });
  }
}

function navToggle(e) {
  if (!e.target.classList.contains("active")) {
    e.target.classList.add("active");
    gsap.to(".line1", 0.5, { rotate: "45", y: 5, background: "black" });
    gsap.to(".line2", 0.5, { rotate: "-45", y: -5, background: "black" });
    gsap.to("#logo", 1, { color: "black" });
    gsap.to(".nav-bar", 0.75, { clipPath: "circle(2500px at 100% -10%)" });
    document.body.classList.add("hide");
  } else {
    e.target.classList.remove("active");
    gsap.to(".line1", 1, { rotate: "0", y: 0, background: "white" });
    gsap.to(".line2", 1, { rotate: "0", y: 0, background: "white" });
    gsap.to("#logo", 1, { color: "white" });
    gsap.to(".nav-bar", 0.75, { clipPath: "circle(50px at 100% -10%)" });
    document.body.classList.remove("hide");
  }
}

const logo = document.querySelector("#logo");
logo.addEventListener("click", removeMouseActive);

function removeMouseActive() {
  mouse.classList.remove("nav-active");
}

barba.init({
  /*
    ? what is views array ?
    * views array is an array of objects consists of these properties :
    * 1. namespace : the name of page (components) that is defined in the HTML with data-barba-namespace
    * 2. beforeEnter : collections of logic that will runs when the page rendered
    * 3. beforeLeave : collections of logic that will runs when the page ends (transitioned into other pages etc)
  */
  views: [
    {
      namespace: "home",
      beforeEnter() {
        animateSlides();
        logo.href = "./index.html";
      },
      beforeLeave() {
        slideScene.destroy();
        pageScene.destroy();
        controller.destroy();
      },
    },
    {
      namespace: "the-lost-sheep",
      beforeEnter() {
        logo.href = "../index.html";
        detailAnimation();
      },
      beforeLeave() {
        controller.destroy();
        detailScene.destroy();
      },
    },
    {
      namespace: "mustard-seed",
      beforeEnter() {
        logo.href = "../index.html";
        detailAnimation();
      },
      beforeLeave() {
        controller.destroy();
        detailScene.destroy();
      },
    },
    {
      namespace: "fig-tree",
      beforeEnter() {
        logo.href = "../index.html";
        detailAnimation();
      },
      beforeLeave() {
        controller.destroy();
        detailScene.destroy();
      },
    },
  ],

  /*  
    ? what are the transitions property ?
    * leave indicates a method that we'll be doing when we leaving current page
    * enter indicates a method that we'll be doing when entering the next pages
  */
  transitions: [
    {
      /*
        ? what is current parameter ?
        * current parameter consists of all components inside barba-container
      */
      leave({ current, next }) {
        /*
          ? what is this.async() ?
          * it's a function provided by barba to run when we transition between pages
        */
        let done = this.async();
        // animation
        const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        timeline.fromTo(current.container, 1, { opacity: 1 }, { opacity: 0 });
        timeline.fromTo(
          ".swipe",
          0.5,
          { x: "-100%" },
          { x: "0%", onComplete: done },
          "-=0.2"
        );
      },
      enter({ current, next }) {
        let done = this.async();
        // scroll to the top
        window.scrollTo(0, 0);
        const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        timeline.fromTo(
          ".swipe",
          0.5,
          { x: "0%" },
          /*
            stagger : delete each swipe object
          */
          { x: "100%", stagger: 0.25, onComplete: done }
        );
        timeline.fromTo(next.container, 1, { opacity: 0 }, { opacity: 1 });
        timeline.fromTo(
          ".nav-header",
          1,
          { y: "-100%" },
          { y: "0%", ease: "power2.inOut" },
          "-=0.25"
        );
      },
    },
  ],
});

function detailAnimation() {
  controller = new ScrollMagic.Controller();
  const slides = document.querySelectorAll(".detail-slide");
  slides.forEach((slide, index, slides) => {
    const slideTimeline = gsap.timeline({ defaults: { duration: 1 } });
    let nextSlide = index === slides.length - 1 ? "end" : slides[index + 1];
    const nextImg = nextSlide.querySelector("img");
    slideTimeline.fromTo(slide, { opacity: 1 }, { opacity: 0 });
    slideTimeline.fromTo(nextSlide, { opacity: 0 }, { opacity: 1 }, "-=1.5");

    detailScene = new ScrollMagic.Scene({
      triggerElement: slide,
      duration: "100%",
      triggerHook: 0,
    })
      .setPin(slide, { pushFollowers: false })
      .setTween(slideTimeline)
      .addTo(controller);
  });
}

burger.addEventListener("click", navToggle);
burger.addEventListener("click", removeMouseActive);
window.addEventListener("mousemove", cursor);
window.addEventListener("mouseover", activeCursor);

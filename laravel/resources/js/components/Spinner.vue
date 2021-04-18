<template>
  <div>
    <div class="loader" :class="`loader-${size}`"></div>
  </div>
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      required: false,
      default: "md",
      validator(val) {
        return ["xs", "sm", "md", "lg"].indexOf(val) !== -1;
      },
    },
  },
};
</script>
<style>
.loader-xs {
  width: 4rem;
  height: 4rem;
}

.loader-sm {
  width: 6rem;
  height: 6rem;
}

.loader-md {
  width: 8rem;
  height: 8rem;
}

.loader-lg {
  width: 10rem;
  height: 10rem;
}

.loader {
  font-size: 10px;
  margin: 50px auto;
  text-indent: -9999em;
  border-radius: 50%;
  background: #666;
  background: -moz-linear-gradient(left, #666 10%, rgba(51, 51, 51, 0) 42%);
  background: -webkit-linear-gradient(left, #666 10%, rgba(51, 51, 51, 0) 42%);
  background: -o-linear-gradient(left, #666 10%, rgba(51, 51, 51, 0) 42%);
  background: -ms-linear-gradient(left, #666 10%, rgba(51, 51, 51, 0) 42%);
  background: linear-gradient(to right, #666 10%, rgba(51, 51, 51, 0) 42%);
  position: relative;
  -webkit-animation: load3 1.8s infinite linear;
  animation: load3 1.8s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}

.loader:before {
  width: 50%;
  height: 50%;
  background: #666;
  border-radius: 100% 0 0 0;
  position: absolute;
  top: 0;
  left: 0;
  content: "";
}

.loader:after {
  background: rgba(239, 246, 255);
  width: 85%;
  height: 85%;
  border-radius: 50%;
  content: "";
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
@-webkit-keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>

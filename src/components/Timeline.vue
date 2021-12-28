<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vue-router@4"></script>

<template>
  <v-app>
    <v-container>
      <v-row>          
        <div class="outer">
          <v-col cols="4" class="d-flex justify-center align-center">
            <div class="pa-2">
              <h3 class="pb-2">Visualização de Linhas do Tempo</h3>
                <p>
                Organizado por data de nascimento e morte do/da artista
                </p>
            </div>
            Filtrar por técnicas de pintura:
            <select id="selectButton"></select>
            Escala (início/fim):
            <input type="number" id="buttonXstart" value=1500>
            <input type="number" id="buttonXend" value=2000>
          </v-col>
          <div class="inner"> 
            <v-col id="my_dataviz" />
          </div>
        </div>
      </v-row>
    </v-container>
     
  </v-app>
</template>

<script>
import * as d3 from "d3";
import MainGraph from '../mainGraph';

export default {
  name: 'Timeline',
  async mounted() {
    var data = d3.csv("/exit.csv");
    await this.createGraph(data);
  },
  methods: {
    
    async createGraph(data) {
      var g = new MainGraph(data);
      g.createGraph();
    },

  }
};
</script>

<style>
.outer {
    width: auto;
    height: auto;
    overflow: auto;
}
.inner {
    display: block;
    width: 100%;
    height: 100%;
}
.svg-container {
    display: inline-block;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    width: 100%;
    padding-bottom: 100%; /* aspect ratio */
    vertical-align: top;
    overflow: hidden;
}
.svg-content-responsive {
    display: inline-block;
    position: absolute;
    top: 10px;
    left: 0;
}

.zoom {
  cursor: move;
  fill: none;
  pointer-events: all;
}
</style>
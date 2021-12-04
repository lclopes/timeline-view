<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col cols="4" class="d-flex justify-center align-center">
          <div class="pa-2">
            <h3 class="pb-2">Visualização de Linhas do Tempo</h3>
              <p>
              Organizado por data de nascimento e morte do/da artista
              </p>
              
            </div>
          </v-col>
        <div class="outer">
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
    }
    
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
    width: 800px;
    height: 600px;
}
</style>
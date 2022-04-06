<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vue-router@4"></script>

<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col cols="4" class="d-flex justify-center align-center">
          <div class="pa-2">
            <h3 class="pb-2">Visualização de Linhas do Tempo de Obras de Arte</h3>
            <p>Organizado por data de nascimento e morte do/da artista</p>
            <p><button id="prevPage">Página anterior</button>
            <button id="nextPage">Próxima página</button></p>
          </div>
          <div class="pa-1">
            Filtrar por técnicas de pintura (concluído):
          <select id="selectButton"></select>
          <!-- Escala (início/fim):
          <input type="number" id="buttonXstart" value="1500" />
          <input type="number" id="buttonXend" value="2000" /> -->
          </div>
          
          
          
          <!-- <button id="">Restaurar zoom</button> -->
        </v-col>
        <br /><br />
        <div class="inner" >
          <div class="outer">
            <v-col id="my_dataviz" />
          </div>
        </div>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import * as d3 from "d3";
import MainGraph from "../mainGraph";

export default {
  name: "Timeline",
  async mounted() {
    var data = d3.csv("/exit.csv");
    await this.createGraph(data);
  },
  methods: {
    async createGraph(data) {
      var g = new MainGraph(data);
      g.createGraph();
    },
  },
};
</script>

<style>
.outer {
  width: auto;
  height: 100%;
  overflow: auto;
}
.inner {
  display: block;
  width: 1400px;
  height: 800px;
  margin: 0 auto; 
}
.axisWhite{
  stroke: white
}
</style>
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vue-router@4"></script>

<template>
  <v-app>
    <v-container>
      <v-row>
        
        <v-col cols="1" class="d-flex">
          <!-- <v-col>
          Legenda<br>
          <div class="pa-1">Anos de nascimento e morte conhecidos<br><svg id="colorLegend1"></svg></div>
          <div class="pa-1">Ano de nascimento desconhecido<br><svg id="colorLegend2"></svg></div>
          <div class="pa-1">Ano de morte desconhecido<br><svg id="colorLegend3"></svg></div>
        </v-col> -->
          <div class="pa-1">
            <h3 class="pb-2">Visualização de Linhas do Tempo de Obras de Arte</h3>
            <p>Organizado por data de nascimento e morte do/da artista</p>
            <p><button id="prevPage">Página anterior</button>
            <button id="nextPage">Próxima página</button>
             Página <span id="thisPage"></span></p>
          </div>
          <div class="pa-1">
            Técnica de pintura:
            <select id="selectTechnique"></select>
          </div>
          <br>
          <div class="pa-1">
              Meio utilizado:
            <select style="max-width:10%" id="selectMedium"></select>
          </div>
          <br>
          Filtro selecionado: <span id="selectedFilter"></span>
          <!-- <button id="">Restaurar zoom</button> -->
        </v-col>
        
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

.mediumDropdown {
  width:100px;
  align-content: center;
}

.mediumDropdown option {
  max-width:90%;
}
</style>
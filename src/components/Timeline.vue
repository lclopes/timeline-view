<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col cols="4" class="d-flex justify-center align-center">
          <div class="pa-2">
            <h3 class="pb-2">Exemplo</h3>
            <p>
            Visualização em Linha do Tempo
            </p>
            <label for="ranges">Intervalo  </label>
            <select id="ranges" name="ranges">
              <option value="1">1700-1800</option>
              <option value="2">1800-1900</option>
              <option value="3">1700-1900</option>
            </select>
          </div>
        </v-col>
        <v-col id="my_dataviz" />
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
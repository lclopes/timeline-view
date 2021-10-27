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
    const data = await d3.csv("/exit.csv");
    this.createGraph(data)
  },
  methods: {
    
    createGraph(data) {
      const g = new MainGraph(data);
      g.createGraph();
    }
}
};
</script>
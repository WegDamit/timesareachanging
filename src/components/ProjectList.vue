<template>
  <q-list highlight >
    <q-list-header>Projects</q-list-header>
    <q-item v-for="project in projects" :key="project._id">
      <q-item-side left>
        <q-item-tile icon="directions_run" color="black" />
      </q-item-side>
      <q-item-main class="row xs-gutter" v-on:click="clickPrjFn(project._id)" >
        <q-item-tile label class="col-4">{{project.title}}</q-item-tile>
        <q-item-tile sublabel multiline class="col">{{project.description}}</q-item-tile>
        <q-item-tile v-if="project.range" class="col-auto prjDate">
          {{formatGenericDate(project.range.from, 'DD. MMM YY')}} &mdash;
          <br />
          {{formatGenericDate(project.range.to, 'DD. MMM YY')}}
      </q-item-tile>
      </q-item-main>
    </q-item>
  </q-list>
</template>

<script>
import {
  date,
  QItem,
  QItemMain,
  QItemSide,
  QItemSeparator,
  QItemTile,
  QList,
  QListHeader
} from 'quasar'

const
  { formatDate } = date

export default {
  name: 'ProjectList',
  props: ['projects', 'clickPrjFn'],
  components: {
    date,
    QItem,
    QItemMain,
    QItemSide,
    QItemSeparator,
    QItemTile,
    QList,
    QListHeader
  },
  methods: {
    formatGenericDate (t, f) {
      return formatDate(t, f)
    }
  }
}
</script>

<style lang="stylus" type="text/stylus" scoped>
.prjDate
  font-size 80%
</style>

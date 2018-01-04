<template>
  <q-list highlight class="projectlist">
    <q-list-header>Projects</q-list-header>
    <q-item v-for="project in projects" :key="project._id">
      <q-item-side left class="self-start">
        <q-item-tile icon="directions_run" color="black" />
      </q-item-side>
      <q-item-main v-ripple class="row xs-gutter" v-on:click="clickPrjFn(project._id)" >
        <q-item-tile label class="col-4">{{project.title}}</q-item-tile>
        <q-item-tile sublabel multiline class="col">{{project.description}}</q-item-tile>

        <q-item-tile v-if="project.range" class="col-8 offset-4 prjDate">
          {{formatGenericDate(project.range.from, 'DD. MMM YY')}} &mdash;
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
  QListHeader,
  Ripple
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
    QListHeader,
    Ripple
  },
  methods: {
    formatGenericDate (t, f) {
      return formatDate(t, f)
    }
  },
  directives: {
    Ripple
  }
}
</script>

<style lang="stylus" type="text/stylus" scope>
.projectlist
  .prjDate
    font-size 80%
</style>

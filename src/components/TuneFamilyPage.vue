<template>
    <div class="row">
        <h1>{{fam.replaceAll("_"," ")}} Tune Family</h1>
    </div>
    <div class="row">
        <div class="col-12">
            <table v-if="tuneFamilyList.length > 0" class="table table-hover mt-3">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Type</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(tune, index) in tuneFamilyList" :key="index" @click="openDetails(tune.id.value)">
                    <td>{{ tune.title.value }}</td>
                    <td>{{ tune.id.value}}</td>
                    <td>{{ tune.type.value}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: 'TuneFamilyPage',
    data() {
        return {
            fam: this.$route.params.fam,
            tuneFamilyList: [],
        }
    },
    methods: {
        getTuneFamilyMembers(fam){
            let params = {
                family: fam
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/tuneFamilyMembers', { params })
                .then(response => {
                    this.tuneFamilyList = response.data.results.bindings;

                    //console.log(this.tuneData[0].title.value)
                })
                .catch(error => {
                    console.error(error);
                });
        },
        openDetails(id) {
            this.$router.push({ name: 'CompositionPage', params: { id: id}});
        },
    },
    mounted() {
        this.getTuneFamilyMembers(this.fam);
    }
}
</script>


<style scoped>

</style>
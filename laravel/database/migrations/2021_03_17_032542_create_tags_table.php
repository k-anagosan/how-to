<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTagsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table): void {
            $table->string('post_id');
            $table->unsignedBigInteger('tag_name_id');
            $table->timestamps();

            $table->foreign('post_id')->references('id')->on('posts');
            $table->foreign('tag_name_id')->references('id')->on('tag_names');

            $table->unique(['post_id', 'tag_name_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
}

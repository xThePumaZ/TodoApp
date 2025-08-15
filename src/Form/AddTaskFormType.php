<?php

declare(strict_types=1);

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AddTaskFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'label' => 'Task Title',
                'required' => true,
            ])
            ->add('description', TextType::class, [
                'label' => 'Description',
                'required' => false,
            ])
            ->add('due_date', DateType::class, [
                'label' => 'Due Date',
                'required' => false,
                'format' => 'yyyy-MM-dd',
                'widget' => 'single_text',
            ])
            ->add('priority', TextType::class, [
                'label' => 'Priority',
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'App\Entity\Task',
            'csrf_protection' => true,
            'csrf_field_name' => 'csfr_token',
            'csrf_token_id' => 'add_task',
        ]);
    }
}

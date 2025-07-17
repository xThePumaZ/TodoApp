<?php

declare(strict_types=1);

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AddTaskFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', null, [
                'label' => 'Task Title',
                'required' => true,
            ])
            ->add('description', null, [
                'label' => 'Description',
                'required' => false,
            ])
            ->add('due_date', null, [
                'label' => 'Due Date',
                'required' => false,
            ])
            ->add('priority', null, [
                'label' => 'Priority',
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
    }
}
